const express = require('express');
const { renderDbPage, resetDb, seedDb } = require('../controllers/dbController');

const router = express.Router();

router.get('/', renderDbPage);
router.post('/reset', resetDb);
router.post('/seed', seedDb);

module.exports = router;
