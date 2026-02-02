const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Името е задолжително'],
    trim: true,
    maxlength: [50, 'Името не може да биде подолго од 50 знаци']
  },
  email: {
    type: String,
    required: [true, 'Е-поштата е задолжителна'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Внесете валидна е-пошта']
  },
  password: {
    type: String,
    required: [true, 'Лозинката е задолжителна'],
    minlength: [6, 'Лозинката мора да има најмалку 6 знаци'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// hash pass
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// check pass
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);