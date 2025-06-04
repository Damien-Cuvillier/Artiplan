require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const securityMiddleware = require('./middleware/security');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const clientsRoutes = require('./routes/clients');
const chantiersRoutes = require('./routes/chantiers');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const interventionRoutes = require('./routes/interventions');
const createIndexes = require('./models/index');
// Middleware de sécurité
securityMiddleware(app);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
// Appliquez le rate limiting aux routes d'authentification
app.use('/api/auth', limiter);
// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173', // ou l'URL du frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/chantiers', chantiersRoutes);
app.use('/api/interventions', interventionRoutes);
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
  createIndexes();
// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
