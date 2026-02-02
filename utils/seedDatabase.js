const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Comment = require('../models/Comment');
const WeatherCache = require('../models/WeatherCache');

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Comment.deleteMany({});
    await WeatherCache.deleteMany({});

    console.log('Базата на податоци е исчистена');

    const users = await User.create([
      {
        name: 'Администратор',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        avatar: 'admin-avatar.png'
      },
      {
        name: 'Јован Петров',
        email: 'jovan@example.com',
        password: 'password123',
        avatar: 'user1.jpg'
      },
      {
        name: 'Марија Стојанова',
        email: 'marija@example.com',
        password: 'password123',
        avatar: 'user2.jpg'
      },
      {
        name: 'Александар Николов',
        email: 'aleksandar@example.com',
        password: 'password123',
        avatar: 'user3.jpg'
      }
    ]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const events = await Event.create([
      {
        title: 'Технолошка конференција 2024',
        description: 'Голема конференција за најновите трендови во технологијата',
        category: 'conference',
        location: 'Скопје',
        address: {
          street: 'Бул. Партизански Одреди',
          city: 'Скопје',
          country: 'Македонија'
        },
        date: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), 
        maxParticipants: 200,
        price: 2500,
        organizer: users[0]._id,
        isOutside: false,
        status: 'published',
        image: 'conference.jpg'
      },
      {
        title: 'Семинар за Веб Развој',
        description: 'Интензивен семинар за модерен веб развој',
        category: 'workshop',
        location: 'Битола',
        date: tomorrow,
        endDate: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000), 
        maxParticipants: 30,
        price: 1500,
        organizer: users[1]._id,
        isOutside: false,
        status: 'published',
        image: 'workshop.jpg'
      },
      {
        title: 'Пикник во парк',
        description: 'Релаксирачки пикник за целата фамилија',
        category: 'social',
        location: 'Парк Гордана',
        date: nextMonth,
        endDate: new Date(nextMonth.getTime() + 5 * 60 * 60 * 1000), 
        maxParticipants: 100,
        price: 0,
        organizer: users[2]._id,
        isOutside: true,
        status: 'published',
        image: 'picnic.jpg'
      },
      {
        title: 'Мастер класа за готвење',
        description: 'Научете да готвите традиционални јадења',
        category: 'workshop',
        location: 'Охрид',
        date: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        maxParticipants: 20,
        price: 2000,
        organizer: users[3]._id,
        isOutside: false,
        status: 'draft',
        image: 'cooking.jpg'
      }
    ]);

    await Registration.create([
      {
        user: users[1]._id,
        event: events[0]._id,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentAmount: 2500,
        specialRequirements: 'Веган храна'
      },
      {
        user: users[2]._id,
        event: events[0]._id,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentAmount: 2500
      },
      {
        user: users[3]._id,
        event: events[1]._id,
        status: 'pending',
        paymentStatus: 'pending',
        paymentAmount: 1500
      },
      {
        user: users[1]._id,
        event: events[2]._id,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentAmount: 0
      }
    ]);

    await Comment.create([
      {
        content: 'Многу се возбудувам за овој настан!',
        author: users[1]._id,
        event: events[0]._id,
        likes: [users[2]._id]
      },
      {
        content: 'Дали има паркинг на локацијата?',
        author: users[2]._id,
        event: events[0]._id
      },
      {
        content: 'Да, има голем паркинг пред салата.',
        author: users[0]._id,
        event: events[0]._id,
        parentComment: null 
      }
    ]);

    for (const event of events) {
      const count = await Registration.countDocuments({ 
        event: event._id, 
        status: { $in: ['confirmed', 'pending'] } 
      });
      event.currentParticipants = count;
      await event.save();
    }

    console.log('Базата на податоци е успешно населена со тест податоци');
    console.log(`Креирани: ${users.length} корисници, ${events.length} настани`);

  } catch (error) {
    console.error('Грешка при населување на базата:', error);
    throw error;
  }
};

module.exports = seedDatabase;