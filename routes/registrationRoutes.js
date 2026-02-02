// routes/registrationRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const regCtrl = require('../controllers/registrationController');

const router = express.Router();

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

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Избриши регистрација
 *     description: Избриши регистрација по ID (само за сопственикот или админ)
 *     tags:
 *       - Регистрации
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID на регистрацијата
 *     responses:
 *       200:
 *         description: Регистрација успешно избришана
 *       404:
 *         description: Регистрација не пронајдена
 *       403:
 *         description: Немаше право да ја избришете регистрацијата
 */
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