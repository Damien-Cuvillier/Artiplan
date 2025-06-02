const Joi = require('joi');


const createChantierSchema = Joi.object({
  titre: Joi.string()
    .required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Le titre du chantier est requis',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le titre du chantier est requis'
    }),
    
  client_nom: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Le nom du client est requis',
      'any.required': 'Le nom du client est requis'
    }),
    
  date_debut: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'La date de début doit être une date valide',
      'date.format': 'La date de début doit être au format YYYY-MM-DD',
      'any.required': 'La date de début est requise'
    }),
    
  date_fin: Joi.date()
    .iso()
    .min(Joi.ref('date_debut'))
    .messages({
      'date.base': 'La date de fin doit être une date valide',
      'date.format': 'La date de fin doit être au format YYYY-MM-DD',
      'date.min': 'La date de fin doit être postérieure ou égale à la date de début'
    })
    .allow(null, ''),
    
  budget: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.base': 'Le budget doit être un nombre',
      'number.min': 'Le budget ne peut pas être négatif',
      'any.required': 'Le budget est requis'
    }),
    
  priorite: Joi.string()
    .valid('basse', 'moyenne', 'haute', 'critique')
    .default('moyenne')
    .messages({
      'any.only': 'La priorité doit être: basse, moyenne, haute ou critique'
    }),
    
  adresse: Joi.string()
    .required()
    .messages({
      'string.empty': 'L\'adresse est requise',
      'any.required': 'L\'adresse est requise'
    }),
    
  description: Joi.string()
    .allow('')
    .max(2000)
    .messages({
      'string.max': 'La description ne peut pas dépasser {#limit} caractères'
    })
});

const validateChantier = (req, res, next) => {
  const { error } = createChantierSchema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      status: 'fail',
      errors: errorMessages
    });
  }
  
  // Conversion des dates au format ISO
  if (req.body.date_debut && typeof req.body.date_debut === 'string') {
    req.body.date_debut = new Date(req.body.date_debut);
  }
  
  if (req.body.date_fin && typeof req.body.date_fin === 'string') {
    req.body.date_fin = new Date(req.body.date_fin);
  }
  
  next();
};

module.exports = {
  validateChantier
};