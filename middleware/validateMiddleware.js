const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Валидациска грешка',
    errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
  });
};

module.exports = { validate };
