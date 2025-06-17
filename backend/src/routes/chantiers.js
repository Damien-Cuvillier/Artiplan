import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateChantier, validate } from '../validators/chantier.validator.js';
import * as chantierController from '../controllers/chantierController.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(protect);

// GET /api/chantiers - Récupérer tous les chantiers (accessible par admin et gestionnaire)
router.get('/', restrictTo('admin', 'gestionnaire'), chantierController.listeChantiers);

// GET /api/chantiers/mes-chantiers - Les techniciens ne voient que leurs chantiers
router.get('/mes-chantiers', chantierController.getMesChantiers);

// POST /api/chantiers - Créer un nouveau chantier (admin et gestionnaire)
router.post('/', 
  restrictTo('admin', 'gestionnaire'),
  validateChantier,
  validate,
  chantierController.creerChantier
);

// GET /api/chantiers/:id - Voir un chantier spécifique
router.get('/:id', chantierController.getChantier);

// PUT /api/chantiers/:id - Mettre à jour un chantier
router.put('/:id', 
  restrictTo('admin', 'gestionnaire'),
  validateChantier,
  validate,
  chantierController.updateChantier
);

// DELETE /api/chantiers/:id - Supprimer un chantier (admin uniquement)
router.delete('/:id', 
  restrictTo('admin'),
  chantierController.supprimerChantier
);

export default router;