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
      // Si pas de date de fin, c'est valide
      if (!value) return true;
      
      // Si date_debut n'est pas défini, on utilise la date actuelle
      const dateDebut = this.date_debut || new Date();
      return value >= dateDebut;
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
chantierSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`[Middleware] Début de la suppression en cascade pour le chantier ${this._id}`);
  try {
    // Vérifions d'abord si ce middleware est bien appelé
    console.log(`[Middleware] Recherche des interventions pour le chantier ${this._id}`);
    
    // Utilisez this.model() pour accéder au modèle Intervention
    const result = await this.model('Intervention').deleteMany({ 
      chantier_id: this._id 
    });
    
    console.log(`[Middleware] ${result.deletedCount} interventions supprimées pour le chantier ${this._id}`);
    next();
  } catch (error) {
    console.error('[Middleware] Erreur lors de la suppression des interventions:', error);
    next(error);
  }
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
  try {
    const [interventions, chantier] = await Promise.all([
      this.model('Intervention').find({ chantier_id: chantierId }),
      this.findById(chantierId)
    ]);
    
    // Si le chantier est marqué comme terminé, forcer la progression à 100%
    if (chantier.statut === 'termine') {
      chantier.progression = 100;
      return await chantier.save();
    }
    
    // Sinon calculer la progression normale
    const totalInterventions = interventions.length;
    if (totalInterventions === 0) {
      chantier.progression = 0;
      return await chantier.save();
    }
    
    const completedInterventions = interventions.filter(i => i.statut === 'terminee').length;
    chantier.progression = Math.round((completedInterventions / totalInterventions) * 100);
    
    return await chantier.save();
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression du chantier:', error);
    throw error; // Renvoyer l'erreur pour une gestion plus poussée
  }
};

module.exports = mongoose.model('Chantier', chantierSchema);