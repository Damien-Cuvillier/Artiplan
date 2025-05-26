// src/middleware/security.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const securityMiddleware = (app) => {
  // CORS
  app.use(cors());
  
  // Sécurisation des en-têtes HTTP
  app.use(helmet());
  
  // Limitation du taux de requêtes
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par fenêtre
  });
  app.use('/api', limiter);
  
  // Nettoyage des données contre l'injection NoSQL
  app.use(mongoSanitize());
  
  // Protection contre les attaques XSS
  app.use(xss());
  
  // Protection contre la pollution des paramètres HTTP
  app.use(hpp());
};

module.exports = securityMiddleware;