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
  },
  prix: {
    type: Number,
    min: [0, 'Le prix ne peut pas être négatif'],
    default: 0
  }
}, { timestamps: true });

interventionSchema.post('save', async function() {
  // 'this' refers to the current intervention document
  // We need to access the Chantier model to update it
  const Chantier = mongoose.model('Chantier');
  if (this.chantier_id) {
    await Chantier.updateChantierProgress(this.chantier_id);
  }
});

// Hook for findOneAndDelete and findByIdAndDelete
interventionSchema.post(['findOneAndDelete', 'findOneAndRemove'], async function(doc) {
  if (doc && doc.chantier_id) {
    console.log('Post-remove hook - Mise à jour du chantier:', doc.chantier_id);
    const Chantier = mongoose.model('Chantier');
    try {
      await Chantier.updateChantierProgress(doc.chantier_id);
      console.log('Progression du chantier mise à jour avec succès');
    } catch (error) {
      console.error('Erreur dans le post-remove hook:', error);
    }
  }
});


module.exports = mongoose.model('Intervention', interventionSchema);