const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendRegistrationEmail = async (user, event) => {
  try {
    const mailOptions = {
      from: `"EventPlanner Pro" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Потврда за регистрација на настан: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Потврда за регистрација</h2>
          <p>Почитуван/а ${user.name},</p>
          <p>Вашата регистрација за настанот <strong>${event.title}</strong> е успешна!</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3>Детали за настанот:</h3>
            <p><strong>Локација:</strong> ${event.location}</p>
            <p><strong>Датум:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Време:</strong> ${new Date(event.date).toLocaleTimeString()}</p>
          </div>
          <p>Ве очекуваме на настанот!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Оваа порака е автоматски генерирана, ве молам не одговарајте.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email испратен успешно до:', user.email);
  } catch (error) {
    console.error('Грешка при испраќање на email:', error);
  }
};

const sendEventUpdateEmail = async (users, event, updateType) => {
  console.log(`Испраќање ${updateType} email за настан: ${event.title}`);
};

module.exports = { sendRegistrationEmail, sendEventUpdateEmail };