const express = require('express');
const { body } = require('express-validator');
const {
  getRegistrations,
  getMyRegistrations,
  getRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin'), getRegistrations);
router.get('/me', protect, getMyRegistrations);
router.get('/:id', protect, getRegistration);

router.post(
  '/',
  protect,
  [body('event').notEmpty().withMessage('event е задолжително (eventId)')],
  validate,
  createRegistration
);

router.put('/:id', protect, authorize('admin'), updateRegistration);
router.delete('/:id', protect, deleteRegistration);

module.exports = router;
