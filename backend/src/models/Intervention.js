const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// backend/src/models/Intervention.js
const interventionSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date_intervention: { 
    type: Date, 
    default: Date.now
  },
  duree: { 
    type: Number, 
    min: [0, 'La durée ne peut pas être négative'],
    default: 0
  },
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  photos: [String], // Tableau d'URLs de photos
  technicien_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le technicien est requis']
  },
  chantier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: [true, 'Le chantier est requis']
  }
}, { timestamps: true });

module.exports = mongoose.model('Intervention', interventionSchema);