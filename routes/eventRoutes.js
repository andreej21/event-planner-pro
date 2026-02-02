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
 * @swagger
 * /api/events:
 *   get:
 *     summary: Добиј листа на сите настани
 *     description: Врати листа на сите настани со можност за пребарување
 *     tags:
 *       - Настани
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Пребарај по наслов
 *     responses:
 *       200:
 *         description: Успешно добиена листа на настани
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *   post:
 *     summary: Создај нов настан
 *     description: Создај нов настан (само за логирани корисници)
 *     tags:
 *       - Настани
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - date
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               maxParticipants:
 *                 type: number
 *     responses:
 *       201:
 *         description: Настан успешно создаден
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

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Добиј деталите на настан
 *     tags:
 *       - Настани
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Детали на настан
 *   put:
 *     summary: Ажурирај настан
 *     tags:
 *       - Настани
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Настан успешно ажуриран
 *   delete:
 *     summary: Избриши настан
 *     tags:
 *       - Настани
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Настан успешно избришан
 */
router.get('/:id', getEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

/**
 * @swagger
 * /api/events/{eventId}/comments:
 *   get:
 *     summary: Добиј коментари на настан
 *     tags:
 *       - Коментари
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Листа на коментари
 *   post:
 *     summary: Додај коментар на настан
 *     tags:
 *       - Коментари
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Коментар успешно додаден
 */
router.get("/:eventId/comments", commentCtrl.getEventComments);
router.post("/:eventId/comments", protect, commentCtrl.createEventComment);

/**
 * @swagger
 * /api/events/{eventId}/registrations:
 *   post:
 *     summary: Регистрирај се на настан
 *     tags:
 *       - Регистрации
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Успешно регистриран
 *   get:
 *     summary: Провери моја регистрација
 *     tags:
 *       - Регистрации
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Статус на регистрација
 *   delete:
 *     summary: Откажи регистрација
 *     tags:
 *       - Регистрации
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Регистрација успешно откажана
 */
router.post("/:eventId/registrations", protect, regCtrl.participate);
router.get("/:eventId/registrations/me", protect, regCtrl.myStatusForEvent);
router.delete("/:eventId/registrations/me", protect, regCtrl.cancelMyParticipation);

module.exports = router;
