const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Comment = require('../models/Comment');
const WeatherCache = require('../models/WeatherCache');
const seedDatabase = require('../utils/seedDatabase');

const renderDbPage = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!doctype html>
    <html lang="mk">
    <head>
      <meta charset="utf-8" />
      <title>DB Tools</title>
      <style>
        body{font-family:Arial;padding:24px;max-width:720px;margin:0 auto}
        .box{border:1px solid #ddd;padding:16px;border-radius:10px;margin:12px 0}
        button{padding:10px 14px;border-radius:8px;border:1px solid #333;cursor:pointer}
        .danger{background:#ffeded;border-color:#ff5b5b}
      </style>
    </head>
    <body>
      <h1>/db – Database Tools</h1>
      <div class="box danger">
        <h3>Reset (Delete All)</h3>
        <form method="POST" action="/db/reset" onsubmit="return confirm('Сигурно? Ќе избрише СЕ!')">
          <button type="submit">RESET DB</button>
        </form>
      </div>

      <div class="box">
        <h3>Seed (Insert Initial Data)</h3>
        <form method="POST" action="/db/seed" onsubmit="return confirm('Да внесам иницијални податоци?')">
          <button type="submit">SEED DB</button>
        </form>
      </div>
    </body>
    </html>
  `);
};

const resetDb = async (req, res, next) => {
  try {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Comment.deleteMany({});
    await WeatherCache.deleteMany({});

    res.status(200).json({ success: true, message: 'DB reset: избришани сите податоци' });
  } catch (err) {
    next(err);
  }
};

const seedDb = async (req, res, next) => {
  try {
    await seedDatabase();
    res.status(200).json({ success: true, message: 'DB seed: внесени иницијални податоци' });
  } catch (err) {
    next(err);
  }
};

module.exports = { renderDbPage, resetDb, seedDb };
