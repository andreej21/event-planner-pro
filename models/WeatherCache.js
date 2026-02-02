const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
});

weatherCacheSchema.index({ location: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeatherCache', weatherCacheSchema);