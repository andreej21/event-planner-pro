const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { getWeatherForecast } = require('../utils/weatherService');

const canEditEvent = (event, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return String(event.organizer) === String(user._id);
};

// @desc    Get all events (filter/search/sort/pagination)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (m) => `$${m}`);

    let query = Event.find(JSON.parse(queryStr)).populate('organizer', 'name email role');

    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Event.countDocuments(JSON.parse(queryStr));
    query = query.skip(startIndex).limit(limit);

    const events = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event (with comments + weather if outside)
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar role')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'name avatar role' },
      });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Настанот не е пронајден' });
    }

    if (event.isOutside && event.date) {
      const weather = await getWeatherForecast(event.location, event.date);
      const eventObj = event.toObject();
      eventObj.weatherForecast = weather;
      return res.status(200).json({ success: true, data: eventObj });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner/admin)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Настанот не е пронајден' });
    }

    if (!canEditEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: 'Немаш пристап да го уредиш овој настан' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (owner/admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Настанот не е пронајден' });
    }

    if (!canEditEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: 'Немаш пристап да го избришеш овој настан' });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({ success: true, message: 'Настанот е избришан' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
