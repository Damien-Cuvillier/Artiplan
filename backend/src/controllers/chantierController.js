// src/controllers/chantierController.js
const Chantier = require('../models/Chantier');

exports.creerChantier = async (req, res) => {
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
      statut: statut || (priorite === 'critique' ? 'en_cours' : 'en_attente'), // Modification ici
      adresse,
      description: description || '',
      responsable_id: req.user._id
    });
    if (!req.body.date_debut && !chantier.date_debut) {
      req.body.date_debut = new Date();
    }
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
    
    // Gestion des erreurs de validation Mongoose
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
    
    // Erreur de duplication de référence
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un chantier avec cette référence existe déjà',
        field: 'reference'
      });
    }
    
    // Erreur serveur
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la création du chantier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getChantier = async (req, res) => {
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

exports.listeChantiers = async (req, res) => {
  try {
    const chantiers = await Chantier.find()
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
// Dans chantierController.js
// fetchChantierById: async (id) => {
//   set({ isLoading: true, error: null });
//   try {
//     const token = localStorage.getItem('token');
//     const response = await fetch(`${API_BASE_URL}/api/chantiers/${id}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Erreur lors de la récupération du chantier');
//     }

//     const responseData = await response.json();
//     console.log('Chantier reçu:', responseData);
    
//     set(state => ({
//       currentChantier: responseData.data.chantier,
//       isLoading: false
//     }));

//     return responseData.data.chantier;
//   } catch (error) {
//     console.error('Erreur fetchChantierById:', error);
//     set({ error: error.message, isLoading: false });
//     throw error;
//   }
// }