// src/models/index.js
import mongoose from 'mongoose';

/**
 * Crée les index nécessaires pour optimiser les requêtes
 * Cette fonction est appelée après la connexion à la base de données
 * @async
 * @function createIndexes
 * @returns {Promise<void>}
 */
export async function createIndexes() {
  try {
    // Création de l'index sur chantier_id dans le modèle Intervention
    await mongoose.model('Intervention').createIndexes([
      { chantier_id: 1 }  // 1 pour ordre croissant, -1 pour décroissant
    ]);
    
    console.log('✅ Indexes créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
    // On ne throw pas l'erreur pour ne pas bloquer le démarrage de l'application
    // mais on la loggue pour le débogage
  }
}

export default createIndexes;