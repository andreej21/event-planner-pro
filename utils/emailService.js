const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Lazy initialization на Nodemailer transporter
 * 
 */
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER или EMAIL_PASS не се поставени во .env');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

/**
 * Email при регистрација на корисник
 * @param {Object} user
 */
const sendRegistrationEmail = async (user) => {
  try {
    const transporter = getTransporter();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
      from: `"EventPlanner Pro" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Добредојдовте во EventPlanner Pro!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #999;
      font-size: 12px;
    }
    .user-details {
      background: white;
      padding: 20px;
      border-left: 4px solid #4CAF50;
      margin: 20px 0;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>🎉 Добредојдовте!</h1>
    <p>Вашата регистрација е успешна</p>
  </div>

  <div class="content">
    <h2>Почитуван/а ${user.name},</h2>

    <p>
      Ви благодариме што се регистриравте на
      <strong>EventPlanner Pro</strong>!
    </p>

    <div class="user-details">
      <h3>🔑 Вашите детали:</h3>
      <p><strong>Име:</strong> ${user.name}</p>
      <p><strong>Е-пошта:</strong> ${user.email}</p>
      <p><strong>Улога:</strong> ${user.role || 'Корисник'}</p>
    </div>

    <p>Со вашата сметка можете да:</p>
    <ul>
      <li>✅ Прегледувате и пребарувате настани</li>
      <li>✅ Креирате сопствени настани</li>
      <li>✅ Се регистрирате на настани</li>
      <li>✅ Коментирате и споделувате мислења</li>
    </ul>

    <div style="text-align: center;">
      <a href="${frontendUrl}/events" class="button">
        🔍 Започнете со преглед на настани
      </a>
    </div>

    <p style="margin-top: 30px;">
      Доколку имате прашања, слободно контактирајте нè.
    </p>

    <p>
      Со почит,<br>
      <strong>Тимот на EventPlanner Pro</strong>
    </p>
  </div>

  <div class="footer">
    <p>Оваа порака е автоматски генерирана. Ве молиме не одговарајте.</p>
    <p>© ${new Date().getFullYear()} EventPlanner Pro</p>
  </div>

</body>
</html>
      `,
      text: `Добредојдовте ${user.name}!

Ви благодариме што се регистриравте на EventPlanner Pro.

Вашите детали:
Име: ${user.name}
Е-пошта: ${user.email}
Улога: ${user.role || 'Корисник'}

Започнете со преглед на настани:
${frontendUrl}/events

Со почит,
Тимот на EventPlanner Pro
`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Registration email испратен до ${user.email}`);
    return info;
  } catch (error) {
    console.error('❌ Грешка при испраќање registration email:', error.message);
    return null;
  }
};


module.exports = {
  sendRegistrationEmail
};
