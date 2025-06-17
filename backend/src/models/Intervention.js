import mongoose from 'mongoose';

const interventionSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Une intervention doit avoir un titre'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
      minlength: [3, 'Le titre doit avoir au moins 3 caractères']
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
      min: [0, 'La durée ne peut pas être négative']
    },
    statut: {
      type: String,
      enum: {
        values: ['planifiee', 'en_cours', 'terminee', 'annulee'],
        message: 'Le statut doit être planifiée, en cours, terminée ou annulée'
      },
      default: 'planifiee'
    },
    type: {
      type: String,
      enum: {
        values: ['maintenance', 'reparation', 'installation', 'controle', 'autre'],
        message: 'Type d\'intervention non valide'
      },
      default: 'maintenance'
    },
    images: [{
      type: String,
      validate: {
        validator: function(v) {
          // Valider que c'est une URL valide ou un chemin de fichier
          return /^\/uploads\/.*/.test(v) || /^https?:\/\//.test(v);
        },
        message: props => `${props.value} n'est pas une URL d'image valide`
      }
    }], 
    prix: {
      type: Number,
      min: [0, 'Le prix ne peut pas être négatif']
    },
    technicien_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null
    },
    chantier_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chantier',
      required: [true, 'Une intervention doit être liée à un chantier']
    },
    signature: {
      type: String,
      select: false
    },
    notes_techniques: {
      type: String,
      trim: true
    },
    materiel_utilise: [{
      nom: String,
      quantite: Number,
      reference: String
    }]
  }, { timestamps: true },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances des requêtes
interventionSchema.index({ chantier_id: 1 });
interventionSchema.index({ technicien_id: 1 });
interventionSchema.index({ date_intervention: -1 });
interventionSchema.index({ statut: 1 });

// Middleware pour nettoyer les références lors de la suppression
interventionSchema.pre('remove', async function(next) {
  try {
    // Supprimer la référence de ce chantier dans le modèle Chantier
    await this.model('Chantier').updateMany(
      { interventions: this._id },
      { $pull: { interventions: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour formater la date avant l'envoi au client
interventionSchema.methods.toJSON = function() {
  const intervention = this.toObject();
  
  // Formater la date pour un affichage plus lisible
  if (intervention.date_intervention) {
    intervention.date_intervention = new Date(intervention.date_intervention).toISOString();
  }
  
  // Ajouter l'URL complète pour les images
  if (intervention.images && intervention.images.length > 0) {
    intervention.images = intervention.images.map(img => 
      img.startsWith('http') ? img : `${process.env.BASE_URL}${img}`
    );
  }
  
  return intervention;
};

const Intervention = mongoose.model('Intervention', interventionSchema);

export default Intervention;