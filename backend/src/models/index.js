// src/models/index.js
const mongoose = require('mongoose');

// Cette fonction sera appelée quand la connexion à la base de données est établie
async function createIndexes() {
  try {
    // Création de l'index sur chantier_id dans le modèle Intervention
    await mongoose.model('Intervention').createIndexes([
      { chantier_id: 1 }  // 1 pour ordre croissant, -1 pour décroissant
    ]);
    
    console.log('Indexes créés avec succès');
  } catch (error) {
    console.error('Erreur lors de la création des index:', error);
  }
}

module.exports = createIndexes;