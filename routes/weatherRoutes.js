const express = require('express');
const { getWeather } = require('../controllers/weatherController');

const router = express.Router();

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Добиј временска прогноза
 *     description: Добиј временска прогноза за одредена локација и датум
 *     tags:
 *       - Време
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Локација за веќе
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Датум за прогноза
 *     responses:
 *       200:
 *         description: Временска прогноза
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: string
 *                 temperature:
 *                   type: number
 *                 description:
 *                   type: string
 *       400:
 *         description: Недостасуваат параметри
 */
router.get('/', getWeather);

module.exports = router;
