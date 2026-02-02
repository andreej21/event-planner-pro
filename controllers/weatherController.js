const { getWeatherForecast } = require('../utils/weatherService');

// @desc Get weather for location/date (cached)
// @route GET /api/weather?location=Skopje&date=2026-02-10
// @access Public
const getWeather = async (req, res, next) => {
  try {
    const { location, date } = req.query;

    if (!location || !date) {
      return res.status(400).json({ success: false, message: 'Прати location и date query params' });
    }

    const data = await getWeatherForecast(location, date);
    if (!data) {
      return res.status(502).json({ success: false, message: 'Не успеав да земам прогноза од надворешниот API' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeather };
