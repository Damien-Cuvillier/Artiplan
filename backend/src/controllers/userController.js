// src/controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
/**
 * Obtenir le profil de l'utilisateur connecté
 * @route GET /api/users/me
 * @access Privé
 */
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
/**
 * Mettre à jour les préférences de notification
 * @route PATCH /api/users/notifications
 * @access Privé
 */
export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { notifications } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { notifications } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  res.json({
    _id: user._id,
    nom: user.nom,
    email: user.email,
    notifications: user.notifications
  });
});
/**
 * Obtenir les préférences de notification
 * @route GET /api/users/notifications
 * @access Privé
 */
export const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications');
  
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  res.json({
    notifications: user.notifications || {}
  });
});

/**
 * Mettre à jour le profil de l'utilisateur connecté
 * @route PATCH /api/users/me
 * @access Privé
 */
export const updateProfile = async (req, res) => {
  try {
    // Ne pas permettre la mise à jour du mot de passe ici
    const { password, ...updateData } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password -__v' 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Échec de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Enregistrer un nouvel utilisateur
 * @route POST /api/users
 * @access Privé (Admin)
 */
export const register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      nom,
      prenom,
      email,
      password,
      role: role || 'technicien'
    });

    await user.save();

    // Ne pas renvoyer le mot de passe
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Échec de la création de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Obtenir tous les utilisateurs
 * @route GET /api/users
 * @access Privé (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Désactiver un utilisateur
 * @route PATCH /api/users/:id/deactivate
 * @access Privé (Admin)
 */
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { 
        new: true,
        select: '-password -__v' 
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la désactivation de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Export par défaut pour la rétrocompatibilité
export default {
  getProfile,
  updateProfile,
  register,
  getAllUsers,
  deactivateUser,
  updateNotificationPreferences,
  getNotificationPreferences
};