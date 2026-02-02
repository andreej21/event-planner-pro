const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // take token od header
      token = req.headers.authorization.split(' ')[1];

      // verificiraj go tokenot 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // dodaj go korisnikot vo request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Невалиден токен - корисникот не постои'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Неавтентициран пристап'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Не автентициран - нема токен'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Корисничката улога ${req.user.role} нема пристап до оваа функција`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };