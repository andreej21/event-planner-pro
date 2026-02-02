const Comment = require('../models/Comment');
const Event = require('../models/Event');

// @desc GET comments (optionally by event)
// @route GET /api/comments?eventId=...
// @access Public
const getComments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.event = req.query.eventId;

    const comments = await Comment.find(filter)
      .sort('-createdAt')
      .populate('author', 'name avatar role')
      .populate('event', 'title');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    next(err);
  }
};

// @desc GET one comment
// @route GET /api/comments/:id
// @access Public
const getComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name avatar role')
      .populate('event', 'title');

    if (!comment) return res.status(404).json({ success: false, message: 'Коментарот не е пронајден' });

    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc Create comment
// @route POST /api/comments
// @access Private
const createComment = async (req, res, next) => {
  try {
    const { content, event: eventId, parentComment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Настанот не постои' });

    const comment = await Comment.create({
      content,
      event: eventId,
      author: req.user.id,
      parentComment: parentComment || null,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc Update comment
// @route PUT /api/comments/:id
// @access Private (owner/admin)
const updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Коментарот не е пронајден' });

    const isOwner = String(comment.author) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Немаш пристап' });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isEdited: true, editedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc Delete comment
// @route DELETE /api/comments/:id
// @access Private (owner/admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Коментарот не е пронајден' });

    const isOwner = String(comment.author) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Немаш пристап' });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Коментарот е избришан' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
};
