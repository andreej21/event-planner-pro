const express = require('express');
const { renderDbPage, resetDb, seedDb } = require('../controllers/dbController');

const router = express.Router();

/**
 * @swagger
 * /db:
 *   get:
 *     summary: Странична за управување со база
 *     description: Доби HTML странична за управување со бazаta на податоци
 *     tags:
 *       - База на податоци
 *     responses:
 *       200:
 *         description: HTML странична за управување
 */
router.get('/', renderDbPage);

/**
 * @swagger
 * /db/reset:
 *   post:
 *     summary: Ресетирај база на податоци
 *     description: Избриши сите податоци од базата на податоци
 *     tags:
 *       - База на податоци
 *     responses:
 *       200:
 *         description: База успешно ресетирана
 */
router.post('/reset', resetDb);

/**
 * @swagger
 * /db/seed:
 *   post:
 *     summary: Насади база со тестни податоци
 *     description: Вмета тестни податоци во базата на податоци
 *     tags:
 *       - База на податоци
 *     responses:
 *       200:
 *         description: База успешно наса со podatoci
 */
router.post('/seed', seedDb);

module.exports = router;
