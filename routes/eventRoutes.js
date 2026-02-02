const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const commentCtrl = require("../controllers/commentController");
const regCtrl = require("../controllers/registrationController");

const router = express.Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *   post:
 *     summary: Create event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getEvents);

router.post(
  '/',
  protect,
  [
    body('title').isLength({ min: 3 }).withMessage('title минимум 3 карактери'),
    body('description').isLength({ min: 10 }).withMessage('description минимум 10 карактери'),
    body('location').notEmpty().withMessage('location е задолжително'),
    body('date').isISO8601().withMessage('date мора ISO8601'),
    body('endDate').isISO8601().withMessage('endDate мора ISO8601'),
  ],
  validate,
  createEvent
);

router.get('/:id', getEvent);

router.put('/:id', protect, updateEvent);

router.delete('/:id', protect, deleteEvent);

router.get("/:eventId/comments", commentCtrl.getEventComments);
router.post("/:eventId/comments", protect, commentCtrl.createEventComment);

router.post("/:eventId/registrations", protect, regCtrl.participate);
router.get("/:eventId/registrations/me", protect, regCtrl.myStatusForEvent);
router.delete("/:eventId/registrations/me", protect, regCtrl.cancelMyParticipation);

module.exports = router;
