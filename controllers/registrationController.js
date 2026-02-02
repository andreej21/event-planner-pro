const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { sendRegistrationEmail } = require('../utils/emailService');

const updateParticipantsCount = async (eventId) => {
  const count = await Registration.countDocuments({
    event: eventId,
    status: { $in: ['pending', 'confirmed'] },
  });
  await Event.findByIdAndUpdate(eventId, { currentParticipants: count });
};

// @desc GET all registrations
// @route GET /api/registrations
// @access Private (admin only)
const getRegistrations = async (req, res, next) => {
  try {
    const regs = await Registration.find()
      .populate('user', 'name email role')
      .populate('event', 'title date location');

    res.status(200).json({ success: true, count: regs.length, data: regs });
  } catch (err) {
    next(err);
  }
};

// @desc GET my registrations
// @route GET /api/registrations/me
// @access Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const regs = await Registration.find({ user: req.user.id })
      .populate('event', 'title date location organizer');

    res.status(200).json({ success: true, count: regs.length, data: regs });
  } catch (err) {
    next(err);
  }
};

// @desc GET one registration
// @route GET /api/registrations/:id
// @access Private (owner/admin)
const getRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('event', 'title date location organizer');

    if (!reg) return res.status(404).json({ success: false, message: 'Регистрацијата не е пронајдена' });

    const isOwner = String(reg.user._id) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Немаш пристап' });
    }

    res.status(200).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

// @desc Create registration (register to event)
// @route POST /api/registrations
// @access Private
const createRegistration = async (req, res, next) => {
  try {
    const { event: eventId, specialRequirements } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Настанот не постои' });

    const activeCount = await Registration.countDocuments({
      event: eventId,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (event.maxParticipants && activeCount >= event.maxParticipants) {
      return res.status(409).json({ success: false, message: 'Нема слободни места за овој настан' });
    }

    const reg = await Registration.create({
      user: req.user.id,
      event: eventId,
      specialRequirements,
      status: 'confirmed',      
      paymentStatus: 'pending',
      paymentAmount: event.price || 0,
    });

    await updateParticipantsCount(eventId);

    sendRegistrationEmail(req.user, event).catch(() => {});

    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

// @desc Update registration
// @route PUT /api/registrations/:id
// @access Private (admin only)
const updateRegistration = async (req, res, next) => {
  try {
    let reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Регистрацијата не е пронајдена' });

    reg = await Registration.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await updateParticipantsCount(reg.event);

    res.status(200).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

// @desc Delete registration
// @route DELETE /api/registrations/:id
// @access Private (owner/admin)
const deleteRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Регистрацијата не е пронајдена' });

    const isOwner = String(reg.user) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Немаш пристап' });
    }

    const eventId = reg.event;
    await reg.deleteOne();
    await updateParticipantsCount(eventId);

    res.status(200).json({ success: true, message: 'Регистрацијата е избришана' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRegistrations,
  getMyRegistrations,
  getRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
