// resetAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Supprimer l'admin existant
    await User.deleteOne({ email: 'admin@artisan.fr' });
    console.log('Ancien admin supprimé');

    // Créer un nouvel admin (le mot de passe sera hashé par le hook pre('save'))
    const admin = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@artisan.fr',
      password: 'admin123',  // Le hook pre('save') va le hasher
      role: 'admin',
      actif: true
    });

    await admin.save();
    console.log('✅ Nouvel admin créé avec succès');
    console.log('Email: admin@artisan.fr');
    console.log('Mot de passe: admin123');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetAdmin();