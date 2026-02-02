const express = require('express');
const { body } = require('express-validator');
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', getComments);
router.get('/:id', getComment);

router.post(
  '/',
  protect,
  [
    body('content').isLength({ min: 1 }).withMessage('content е задолжително'),
    body('event').notEmpty().withMessage('event е задолжително (eventId)'),
  ],
  validate,
  createComment
);

router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
