require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    const user = await User.findOne({ email: 'admin@artisan.fr' });
    if (!user) {
      console.log('Utilisateur non trouvé');
      return;
    }

    console.log('Utilisateur trouvé:');
    console.log('- Email:', user.email);
    console.log('- Mot de passe hashé:', user.password);
    console.log('- Role:', user.role);
    
    // Tester le mot de passe
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Le mot de passe correspond:', isMatch);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUser();