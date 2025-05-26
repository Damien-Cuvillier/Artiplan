// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const adminExists = await User.findOne({ email: 'admin@artisan.fr' });
    if (adminExists) {
      console.log('L\'administrateur existe déjà');
      process.exit(0);
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      nom: 'Admin',
      prenom: 'Admin',
      email: 'admin@artisan.fr',
      password: hashedPassword,
      role: 'admin',
      actif: true
    });

    await admin.save();
    console.log('Administrateur créé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    process.exit(1);
  }
};

createAdmin();