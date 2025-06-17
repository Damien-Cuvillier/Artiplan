import { body, validationResult } from 'express-validator';

export const validateChantier = [
  body('titre')
    .notEmpty().withMessage('Le titre du chantier est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  
  body('client_nom')
    .notEmpty().withMessage('Le nom du client est requis')
    .trim(),
  
  body('date_debut')
    .notEmpty().withMessage('La date de début est requise')
    .isISO8601().withMessage('La date de début doit être au format YYYY-MM-DD')
    .toDate(),
  
  body('date_fin')
    .optional()
    .isISO8601().withMessage('La date de fin doit être au format YYYY-MM-DD')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.date_debut && value < req.body.date_debut) {
        throw new Error('La date de fin doit être postérieure ou égale à la date de début');
      }
      return true;
    }),
  
  body('budget')
    .notEmpty().withMessage('Le budget est requis')
    .isFloat({ min: 0 }).withMessage('Le budget doit être un nombre positif'),
  
  body('priorite')
    .optional()
    .isIn(['basse', 'moyenne', 'haute', 'critique']).withMessage('La priorité doit être: basse, moyenne, haute ou critique'),
  
  body('adresse')
    .notEmpty().withMessage('L\'adresse est requise'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères')
];

// Middleware pour gérer les erreurs de validation
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Export par défaut pour la rétrocompatibilité
export default { validateChantier, validate };