// src/controllers/chantierController.js
const Chantier = require('../models/Chantier');

exports.creerChantier = async (req, res) => {
  try {
    const { titre, description, adresse, date_debut, budget, client_nom } = req.body;

    const chantier = new Chantier({
      titre,
      description,
      adresse,
      date_debut: date_debut || new Date(),
      budget,
      client_nom,
      responsable_id: req.user._id  // L'ID de l'admin connecté
    });

    await chantier.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        chantier
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Échec de la création du chantier',
      error: err.message
    });
  }
};
exports.listeChantiers = async (req, res) => {
  try {
    const chantiers = await Chantier.find()
      .sort({ date_debut: -1 })
      .select('titre description adresse date_debut budget client_nom statut');
    
    res.status(200).json({
      status: 'success',
      results: chantiers.length,
      data: {
        chantiers
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des chantiers'
    });
  }
};