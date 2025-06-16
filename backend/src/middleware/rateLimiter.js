// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 requêtes par fenêtre
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

// Si vous avez d'autres limiteurs, exportez-les aussi
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limite à 100 requêtes par fenêtre
});