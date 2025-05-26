const Joi = require('joi');

const createChantierSchema = Joi.object({
  titre: Joi.string().required().min(3).max(100),
  description: Joi.string().allow('').max(500),
  adresse: Joi.string().required(),
  code_postal: Joi.string().required(),
  ville: Joi.string().required(),
  date_debut_prevue: Joi.date().iso().required(),
  date_fin_prevue: Joi.date().iso().min(Joi.ref('date_debut_prevue')),
  client_id: Joi.string().hex().length(24).required()
});

const validateChantier = (req, res, next) => {
  const { error } = createChantierSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateChantier
};