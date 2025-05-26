// dropIndex.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Index supprimé avec succès');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });