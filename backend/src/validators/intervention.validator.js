const { body } = require('express-validator');

exports.validateIntervention = [
  body('chantier_id')
    .notEmpty().withMessage('Le chantier est requis')
    .isMongoId().withMessage('ID de chantier invalide'),
  
  body('date_intervention')
    .optional()
    .isISO8601().withMessage('Format de date invalide')
    .toDate(),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères'),
  
  body('statut')
    .optional()
    .isIn(['planifié', 'en_cours', 'terminé', 'annulé'])
    .withMessage('Statut invalide'),
  
  body('materiel_utilise.*.nom')
    .if(body('materiel_utilise').exists())
    .notEmpty().withMessage('Le nom du matériel est requis'),
  
  body('materiel_utilise.*.quantite')
    .if(body('materiel_utilise').exists())
    .isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif')
];

// Middleware pour gérer les erreurs de validation
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }
  next();
};