// src/controllers/chantierController.js
import mongoose from 'mongoose';
import Chantier from '../models/Chantier.js';

export const creerChantier = async (req, res) => {
  try {
    const { 
      titre, 
      client_nom, 
      date_debut, 
      date_fin, 
      budget, 
      priorite, 
      adresse, 
      description,
      statut 
    } = req.body;

    // Création du nouveau chantier
    const nouveauChantier = new Chantier({
      titre,
      client_nom,
      date_debut: date_debut || new Date(),
      date_fin: date_fin || null,
      budget,
      priorite: priorite || 'moyenne',
      statut: statut || (priorite === 'critique' ? 'en_cours' : 'en_attente'),
      adresse,
      description: description || '',
      responsable_id: req.user._id,
      entreprise: req.user.entreprise
    });

    // Sauvegarde du chantier
    const chantierCree = await nouveauChantier.save();
    
    // Réponse avec le chantier créé
    res.status(201).json({
      status: 'success',
      data: {
        chantier: chantierCree
      }
    });
    
  } catch (err) {
    console.error('Erreur lors de la création du chantier:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => ({
        field: el.path,
        message: el.message
      }));
      
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un chantier avec cette référence existe déjà',
        field: 'reference'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la création du chantier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getChantier = async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id)
      .populate('responsable_id', 'nom prenom')
      .lean();

    if (!chantier) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun chantier trouvé avec cet ID'
      });
    }
    // Vérification d'appartenance à l'entreprise
    if (chantier.entreprise !== req.user.entreprise) {
      return res.status(403).json({
        status: 'fail',
        message: 'Accès interdit à ce chantier'
      });
    }
    chantier.client_nom = chantier.client_nom || 'Non spécifié';
    res.status(200).json({
      status: 'success',
      data: {
        chantier
      }
    });

  } catch (err) {
    console.error('Erreur lors de la récupération du chantier:', err);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération du chantier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Exemple dans chantierController.js
export const getAllChantiers = async (req, res) => {
  try {
    // On suppose que req.user.entreprise est bien renseigné par le middleware d'auth
    const chantiers = await Chantier.find({ entreprise: req.user.entreprise });
    res.status(200).json({
      status: 'success',
      results: chantiers.length,
      data: { chantiers }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des chantiers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const supprimerChantier = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log(`Tentative de suppression du chantier ${req.params.id}`);
    
    // Supprimer d'abord toutes les interventions liées à ce chantier
    const Intervention = mongoose.model('Intervention');
    await Intervention.deleteMany({ chantier_id: req.params.id }).session(session);
    
    // Puis supprimer le chantier
    const chantier = await Chantier.findOneAndDelete(
      { _id: req.params.id },
      { session }
    );
    
    if (!chantier) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun chantier trouvé avec cet ID'
      });
    }

    await session.commitTransaction();
    session.endSession();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur lors de la suppression du chantier:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression du chantier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const listeChantiers = async (req, res) => {
  try {
    const chantiers = await Chantier.find({ entreprise: req.user.entreprise })
      .populate('responsable_id', 'nom prenom')
      .sort({ date_debut: -1 });

    res.status(200).json({
      status: 'success',
      results: chantiers.length,
      data: {
        chantiers
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des chantiers:', err);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des chantiers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getMesChantiers = async (req, res) => {
  try {
    const chantiers = await Chantier.find({
      entreprise: req.user.entreprise,
      $or: [
        { responsable_id: req.user._id },
        { 'membres_equipe': req.user._id }
      ]
    })
    .populate('responsable_id', 'nom prenom')
    .sort({ date_debut: -1 });
    
    res.status(200).json({
      status: 'success',
      results: chantiers.length,
      data: {
        chantiers
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de mes chantiers:', err);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de mes chantiers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const updateChantier = async (req, res) => {
  try {
    const chantier = await Chantier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('responsable_id', 'nom prenom');
    
    if (!chantier) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun chantier trouvé avec cet ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        chantier
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du chantier:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => ({
        field: el.path,
        message: el.message
      }));
      
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du chantier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Fonction pour le frontend - à déplacer dans le store Zustand si nécessaire
export const fetchChantierById = async (id, token) => {
  try {
    const response = await fetch(`${process.env.API_BASE_URL || ''}/api/chantiers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération du chantier');
    }

    const responseData = await response.json();
    console.log('Chantier reçu:', responseData);
    
    return responseData.data.chantier;
  } catch (error) {
    console.error('Erreur fetchChantierById:', error);
    throw error;
  }
};

// Export par défaut pour la rétrocompatibilité
export default {
  creerChantier,
  getChantier,
  supprimerChantier,
  listeChantiers,
  getMesChantiers,
  updateChantier,
  fetchChantierById
};
