// src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
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
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    // Ne pas permettre la mise à jour du mot de passe ici
    const { password, ...updateData } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Échec de la mise à jour du profil'
    });
  }
};

// Enregistrer un nouvel utilisateur (admin seulement)
exports.register = async (req, res) => {
    try {
      const { nom, prenom, email, password, role } = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          status: 'error',
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
  
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: 'Échec de la création de l\'utilisateur',
        error: err.message
      });
    }
  };

// Obtenir tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Désactiver un utilisateur (admin seulement)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la désactivation de l\'utilisateur'
    });
  }
};