const Comment = require("../models/Comment");
const Event = require("../models/Event");

// GET /api/events/:eventId/comments (public)
exports.getEventComments = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const exists = await Event.findById(eventId);
    if (!exists) return res.status(404).json({ success: false, message: "Event not found" });

    const comments = await Comment.find({ event: eventId })
      .sort({ createdAt: -1 })
      .populate("author", "name email role avatar");

    res.json({ success: true, data: comments });
  } catch (e) {
    next(e);
  }
};

// POST /api/events/:eventId/comments (private)
exports.createEventComment = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!content || String(content).trim().length < 1) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const comment = await Comment.create({
      content: String(content).trim(),
      event: eventId,
      author: req.user.id
    });

    const populated = await comment.populate("author", "name email role avatar");
    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/comments/:id (private: author or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: "Comment not found" });

    const isOwner = String(c.author) === String(req.user.id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await c.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};
