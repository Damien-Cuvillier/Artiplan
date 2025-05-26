require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const securityMiddleware = require('./middleware/security');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const clientsRoutes = require('./routes/clients');
const chantiersRoutes = require('./routes/chantiers');

const app = express();

// Middleware de sécurité
securityMiddleware(app);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/chantiers', chantiersRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Gestion de Chantiers - Documentation à venir');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Quelque chose a mal tourné !' });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));