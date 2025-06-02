// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
  
  const protect = async (req, res, next) => {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
  
      if (!token) {
        return res.status(401).json({ message: 'Non autorisé, token manquant' });
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
  
        req.user = user;
        next();
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        return res.status(401).json({ message: 'Non autorisé - Token invalide' });
      }
    } catch (error) {
      console.error('Erreur dans le middleware protect:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Vous n\'avez pas les droits nécessaires' 
        });
      }
      next();
    };
  };

  module.exports = { protect, restrictTo };