import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Toutes protégées par authentification
router.use(protect);

// Admin seulement
router.use(restrictTo('admin'));

// Créer un utilisateur
router.post('/', userController.register);

// Autres routes...
router.get('/me', userController.getProfile);
router.get('/', userController.getAllUsers);
router.get('/notifications', userController.getNotificationPreferences);
router.patch('/notifications', userController.updateNotificationPreferences);

export default router;