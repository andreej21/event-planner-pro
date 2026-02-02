// routes/registrationRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const regCtrl = require('../controllers/registrationController');

const router = express.Router();

// Овие функции НЕ постојат во вашиот controller, затоа греши
// router.get('/', protect, authorize('admin'), getRegistrations);
// router.get('/me', protect, getMyRegistrations);
// router.get('/:id', protect, getRegistration);
// router.post('/', protect, [body('event')...], validate, createRegistration);
// router.put('/:id', protect, authorize('admin'), updateRegistration);
// router.delete('/:id', protect, deleteRegistration);

// Овој route веќе го имате во eventRoutes.js како:
// POST /api/events/:eventId/registrations
// Затоа не ви треба овде

// Ако сакате дополнителни routes, додајте ги овие:
// GET /api/registrations/me - Сите мои регистрации
router.get('/me', protect, async (req, res, next) => {
  try {
    const Registration = require('../models/Registration');
    const regs = await Registration.find({ user: req.user.id })
      .populate('event', 'title date location');
    res.json({ success: true, data: regs });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/registrations/:id - Бришење на регистрација
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const Registration = require('../models/Registration');
    const reg = await Registration.findById(req.params.id);
    
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Проверка дали припаѓа на корисникот или е админ
    if (String(reg.user) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await reg.deleteOne();
    
    // Ажурирај currentParticipants на настанот
    const Event = require('../models/Event');
    const event = await Event.findById(reg.event);
    if (event) {
      const newCount = await Registration.countDocuments({
        event: reg.event,
        status: { $in: ["confirmed", "pending"] }
      });
      event.currentParticipants = newCount;
      await event.save();
    }
    
    res.json({ success: true, message: 'Registration deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;