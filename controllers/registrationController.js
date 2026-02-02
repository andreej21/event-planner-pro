const Registration = require("../models/Registration");
const Event = require("../models/Event");

// POST /api/events/:eventId/registrations (private)
exports.participate = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // capacity check
    const count = await Registration.countDocuments({
      event: eventId,
      status: { $in: ["confirmed", "pending"] }
    });

    if (event.maxParticipants && count >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: "Event is full" });
    }

    // create registration (unique index user+event ќе спречи duplicate)
    const reg = await Registration.create({
      user: req.user.id,
      event: eventId,
      status: "confirmed",
      paymentStatus: "pending",
      paymentAmount: event.price || 0
    });

    // update currentParticipants (recalc)
    const newCount = await Registration.countDocuments({
      event: eventId,
      status: { $in: ["confirmed", "pending"] }
    });
    event.currentParticipants = newCount;
    await event.save();

    res.status(201).json({ success: true, data: reg });
  } catch (e) {
    // ако duplicate registration (unique index) -> 11000
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: "Already participating" });
    }
    next(e);
  }
};

// DELETE /api/events/:eventId/registrations/me (private)
exports.cancelMyParticipation = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const reg = await Registration.findOne({ event: eventId, user: req.user.id });
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });

    await reg.deleteOne();

    const event = await Event.findById(eventId);
    if (event) {
      const newCount = await Registration.countDocuments({
        event: eventId,
        status: { $in: ["confirmed", "pending"] }
      });
      event.currentParticipants = newCount;
      await event.save();
    }

    res.json({ success: true, message: "Cancelled" });
  } catch (e) {
    next(e);
  }
};

// GET /api/events/:eventId/registrations/me (private) -> дали сум registered?
exports.myStatusForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const reg = await Registration.findOne({ event: eventId, user: req.user.id });
    res.json({ success: true, data: reg || null });
  } catch (e) {
    next(e);
  }
};
