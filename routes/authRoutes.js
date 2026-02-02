const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрирај нов корисник
 *     description: Создај нов кориснички сметка со име, е-пошта и лозинка
 *     tags:
 *       - Автентикација
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Јоцко Петров"
 *               email:
 *                 type: string
 *                 example: "jocko@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Корисник успешно регистриран
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Грешка при регистрација
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Логирај се во систем
 *     description: Добиј JWT токен со внесување на е-пошта и лозинка
 *     tags:
 *       - Автентикација
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешна логирање
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Невалидна е-пошта или лозинка
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('валиден email е задолжителен'),
    body('password').notEmpty().withMessage('password е задолжително'),
  ],
  validate,
  login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Добиј информации за тренутниот корисник
 *     description: Врати профилни информации за логираниот корисник
 *     tags:
 *       - Автентикација
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешно добиени информации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Не сте логирани
 */
router.get('/me', protect, getMe);

module.exports = router;
