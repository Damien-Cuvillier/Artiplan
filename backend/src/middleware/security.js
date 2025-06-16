// src/middleware/security.js
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

export const securityMiddleware = (app) => {
  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  
  // Sécurisation des en-têtes HTTP
  app.use(helmet());
  
  // Limitation du taux de requêtes
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer dans 15 minutes'
  });
  
  app.use('/api', limiter);
  
  // Nettoyage des données contre l'injection NoSQL
  app.use(mongoSanitize());
  
  // Protection contre les attaques XSS
  app.use(xss());
  
  // Protection contre la pollution des paramètres HTTP
  app.use(hpp({
    whitelist: ['date', 'sort', 'limit', 'page'] // Paramètres autorisés
  }));
};

// Export par défaut pour la rétrocompatibilité
export default securityMiddleware;