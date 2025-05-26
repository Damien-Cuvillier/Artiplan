const mongoose = require('mongoose');

// src/models/chantier.js
const chantierSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  adresse: { type: String, required: true },
  date_debut: { type: Date, default: Date.now },
  budget: { type: Number, required: true },
  client_nom: { type: String, required: true },  // Juste le nom du client
  statut: { 
    type: String, 
    enum: ['en_attente', 'en_cours', 'termine', 'annule'], 
    default: 'en_attente' 
  },
  responsable_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Chantier', chantierSchema);