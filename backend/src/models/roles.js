// src/models/roles.js

/**
 * Middleware pour restreindre l'accès aux routes en fonction des rôles
 * @param  {...string} roles - Les rôles autorisés à accéder à la route
 * @returns {Function} Middleware Express
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Vérifie si l'utilisateur est connecté
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentification requise'
      });
    }

    // Vérifie si le rôle de l'utilisateur est autorisé
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }
    
    next();
  };
};

// Export par défaut pour la rétrocompatibilité
export default restrictTo;