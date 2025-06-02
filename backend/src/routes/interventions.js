const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateIntervention } = require('../validators/intervention.validator');

// Protéger toutes les routes
router.use(protect);

// Routes pour les interventions
router.route('/')
  .post(
    restrictTo('admin', 'gestionnaire', 'technicien'),
    validateIntervention,
    interventionController.createIntervention
  );

// Récupérer les interventions par chantier
router.route('/chantier/:chantierId')
  .get(interventionController.getInterventionsByChantier)
  .post(
    restrictTo('admin', 'gestionnaire', 'technicien'),
    validateIntervention,
    interventionController.createIntervention
  );

// Récupérer les interventions par technicien
router.route('/technicien/:technicienId')
  .get(interventionController.getInterventionsByTechnicien);

// Opérations sur une intervention spécifique
router.route('/:id')
  .get(interventionController.getIntervention)
  .patch(
    restrictTo('admin', 'gestionnaire', 'technicien'),
    validateIntervention,
    interventionController.updateIntervention
  )
  .delete(
    restrictTo('admin', 'gestionnaire'),
    interventionController.deleteIntervention
  );

module.exports = router;