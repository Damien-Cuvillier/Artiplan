const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Pas de token fourni' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

// Login
router.post('/login', authLimiter, authController.login);

// Vérifier le token
router.get('/verify', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      nom: req.user.nom,
      prenom: req.user.prenom,
      role: req.user.role
    }
  });
});

module.exports = router;