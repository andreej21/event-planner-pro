const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');

const getWeatherForecast = async (location, date) => {
  try {
    const cached = await WeatherCache.findOne({
      location: location.toLowerCase(),
      date: new Date(date)
    });

    if (cached && cached.expiresAt > new Date()) {
      console.log('Користам кеширана временска прогноза');
      return cached.data;
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    
    const targetDate = new Date(date);
    const forecasts = response.data.list;
    
    const closestForecast = forecasts.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.dt_txt).getTime() - targetDate.getTime());
      const currDiff = Math.abs(new Date(curr.dt_txt).getTime() - targetDate.getTime());
      return prevDiff < currDiff ? prev : curr;
    });

    const weatherData = {
      location: response.data.city.name,
      date: targetDate,
      temperature: closestForecast.main.temp,
      feelsLike: closestForecast.main.feels_like,
      humidity: closestForecast.main.humidity,
      description: closestForecast.weather[0].description,
      icon: closestForecast.weather[0].icon,
      windSpeed: closestForecast.wind.speed,
      rainProbability: closestForecast.pop || 0
    };

    await WeatherCache.create({
      location: location.toLowerCase(),
      date: targetDate,
      data: weatherData,
      expiresAt: new Date(Date.now() + parseInt(process.env.WEATHER_CACHE_DURATION))
    });

    return weatherData;
  } catch (error) {
    console.error('Грешка при добивање на временска прогноза:', error.message);
    return null;
  }
};

module.exports = { getWeatherForecast };