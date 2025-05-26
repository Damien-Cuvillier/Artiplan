const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Toutes protégées par authentification
router.use(protect);

// Admin seulement
router.use(restrictTo('admin'));

// Créer un utilisateur
router.post('/', userController.register);

// Autres routes...
router.get('/me', userController.getProfile);
router.get('/', userController.getAllUsers);

module.exports = router;