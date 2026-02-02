const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('name минимум 2 карактери'),
    body('email').isEmail().withMessage('валиден email е задолжителен'),
    body('password').isLength({ min: 6 }).withMessage('password минимум 6 карактери'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('валиден email е задолжителен'),
    body('password').notEmpty().withMessage('password е задолжително'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

module.exports = router;
