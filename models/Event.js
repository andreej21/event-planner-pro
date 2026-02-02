const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Насловот е задолжителен'],
    trim: true,
    maxlength: [100, 'Насловот не може да биде подолг од 100 знаци']
  },
  description: {
    type: String,
    required: [true, 'Описот е задолжителен'],
    maxlength: [1000, 'Описот не може да биде подолг од 1000 знаци']
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'social', 'sports', 'other'],
    default: 'other'
  },
  location: {
    type: String,
    required: [true, 'Локацијата е задолжителна']
  },
  address: {
    street: String,
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  date: {
    type: Date,
    required: [true, 'Датумот е задолжителен'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Датумот мора да биде во иднина'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'Крајниот датум е задолжителен']
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Мора да има најмалку 1 учесник'],
    default: 50
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    min: [0, 'Цената не може да биде негативна'],
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: 'default-event.jpg'
  },
  isOutside: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ title: 'text', description: 'text', location: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });

// Virtual populate: Event -> Comments
eventSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'event',
  justOne: false
});

eventSchema.set('toObject', { virtuals: true });
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);