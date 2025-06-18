import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Middlewares et routes
import securityMiddleware from './middleware/security.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clientsRoutes from './routes/clients.js';
import chantiersRoutes from './routes/chantiers.js';
import interventionRoutes from './routes/interventions.js';
import uploadRoutes from './routes/upload.js';
import { cleanupUploads } from './controllers/uploadController.js';

// Configuration d'ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation
dotenv.config();
const app = express();
app.set('trust proxy', 1);
// Middleware de sécurité
securityMiddleware(app);

// Configuration CORS
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:5000',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://artiplan.vercel.app',
    'https://artiplan-production.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 200
};

// Activer CORS pour toutes les routes
app.use(cors(corsOptions));

// Middleware pour ajouter les en-têtes CORS manquants
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5000',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://artiplan.vercel.app',
    'https://artiplan-production.up.railway.app'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  
  // Répondre immédiatement aux requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use('/api/auth', limiter);

// Configuration du dossier d'upload
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration des en-têtes pour les fichiers statiques
const staticOptions = {
  setHeaders: (res, path) => {
    // Autoriser toutes les origines pour les images (à restreindre en production)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Désactiver la mise en cache pour faciliter le débogage
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    // Permettre l'affichage des images dans les iframes et les PDF
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    
    // Type MIME pour les images
    if (path.endsWith('.png')) {
      res.header('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.header('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.gif')) {
      res.header('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.header('Content-Type', 'image/webp');
    }
  }
};

// Servir les fichiers statiques avec les en-têtes configurés
app.use('/uploads', express.static(uploadsDir, staticOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/chantiers', chantiersRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/upload', uploadRoutes);

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

// Nettoyage des uploads
app.use(cleanupUploads);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
