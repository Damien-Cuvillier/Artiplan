const mongoose = require('mongoose');

const chantierSchema = new mongoose.Schema({
  titre: { 
    type: String, 
    required: [true, 'Le titre du chantier est requis'],
    trim: true
  },
  reference: { 
    type: String, 
    unique: true,
    default: function() {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `CH-${year}${month}-${random}`;
    }
  },
  description: {
    type: String,
    trim: true
  },
  adresse: { 
    type: String, 
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  date_debut: { 
    type: Date, 
    required: [true, 'La date de début est requise'],
    default: Date.now 
  },
  date_fin: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.date_debut;
      },
      message: 'La date de fin doit être postérieure ou égale à la date de début'
    }
  },
  budget: { 
    type: Number, 
    required: [true, 'Le budget est requis'],
    min: [0, 'Le budget ne peut pas être négatif']
  },
  priorite: {
    type: String,
    enum: {
      values: ['basse', 'moyenne', 'haute', 'critique'],
      message: 'La priorité doit être: basse, moyenne, haute ou critique'
    },
    default: 'moyenne'
  },
  client_nom: { 
    type: String, 
    required: [true, 'Le nom du client est requis'],
    trim: true
  },
  interventions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention'
  }],
  statut: { 
    type: String, 
    enum: ['en_attente', 'en_cours', 'termine', 'annule'], 
    default: 'en_attente' 
  },
  responsable_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Un responsable est requis']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Chantier', chantierSchema);