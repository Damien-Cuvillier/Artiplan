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
  progression: {
    type: Number,
    default: 0,
    min: [0, 'La progression ne peut pas être inférieure à 0'],
    max: [100, 'La progression ne peut pas être supérieure à 100']
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

// Pre-save hook to update progression if chantier status is 'termine'
chantierSchema.pre('save', function(next) {
  // 'this' refers to the document being saved
  if (this.isModified('statut') && this.statut === 'termine') {
    this.progression = 100;
  }
  next();
});

// Static method to update chantier progress
chantierSchema.statics.updateChantierProgress = async function(chantierId) {
  const Intervention = mongoose.model('Intervention'); // Get the Intervention model

  try {
    const interventions = await Intervention.find({ chantier_id: chantierId });
    const totalInterventions = interventions.length;
    
    if (totalInterventions === 0) {
      // No interventions, progress is 0 or 100 if chantier itself is marked 'termine'
      // For now, let's set to 0 if no interventions.
      // Or, if you want a chantier to be 100% if it has no interventions but is 'termine':
      // const chantier = await this.findById(chantierId);
      // chantier.progression = chantier.statut === 'termine' ? 100 : 0;
      await this.findByIdAndUpdate(chantierId, { progression: 0 });
      return;
    }

    const completedInterventions = interventions.filter(intervention => intervention.statut === 'terminee').length;
    const progress = Math.round((completedInterventions / totalInterventions) * 100);

    await this.findByIdAndUpdate(chantierId, { progression: progress });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression du chantier:', error);
    // Handle error appropriately, maybe re-throw or log
  }
};

module.exports = mongoose.model('Chantier', chantierSchema);