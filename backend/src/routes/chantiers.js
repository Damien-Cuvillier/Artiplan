const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateChantier } = require('../validators/chantier.validator');
const Chantier = require('../models/Chantier');
const chantierController = require('../controllers/chantierController');
// Appliquer l'authentification à toutes les routes
router.use(protect);
router.route('/')
  .get(chantierController.listeChantiers)
  .post(chantierController.creerChantier);
  router.route('/:id')
  .get(chantierController.getChantier);
// GET /api/chantiers - Récupérer tous les chantiers (accessible par admin et gestionnaire)
router.get('/', protect, restrictTo('admin', 'gestionnaire'), async (req, res) => {
  try {
    console.log('Utilisateur authentifié:', req.user); // Pour débogage
    const chantiers = await Chantier.find()
      .populate('client_id', 'nom prenom societe')
      .populate('responsable_id', 'nom prenom');
    res.json(chantiers);
  } catch (err) {
    console.error('Erreur lors de la récupération des chantiers:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chantiers/mes-chantiers - Les techniciens ne voient que leurs chantiers
router.get('/mes-chantiers', async (req, res) => {
  try {
    const chantiers = await Chantier.find({ 
      $or: [
        { responsable_id: req.user._id },
        { 'membres_equipe': req.user._id }
      ]
    })
    .populate('client_id', 'nom prenom societe');
    
    res.json(chantiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chantiers - Créer un nouveau chantier (admin et gestionnaire)
router.post('/', 
  restrictTo('admin', 'gestionnaire'),
  validateChantier,
  async (req, res) => {
    try {
      const chantier = new Chantier({
        ...req.body,
        responsable_id: req.user._id
      });
      const newChantier = await chantier.save();
      res.status(201).json(newChantier);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// GET /api/chantiers/:id - Voir un chantier spécifique
router.get('/:id', async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id)
      .populate('client_id')
      .populate('responsable_id')
      .populate('membres_equipe', 'nom prenom email');
    
    if (!chantier) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }

    // Vérifier les permissions
    const isAllowed = req.user.role === 'admin' || 
                     req.user.role === 'gestionnaire' ||
                     chantier.responsable_id._id.equals(req.user._id) ||
                     chantier.membres_equipe.some(membre => membre._id.equals(req.user._id));

    if (!isAllowed) {
      return res.status(403).json({ message: 'Accès non autorisé à ce chantier' });
    }

    res.json(chantier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/chantiers/:id - Mettre à jour un chantier
router.put('/:id', 
  restrictTo('admin', 'gestionnaire'),
  validateChantier,
  async (req, res) => {
    try {
      const chantier = await Chantier.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!chantier) {
        return res.status(404).json({ message: 'Chantier non trouvé' });
      }

      res.json(chantier);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE /api/chantiers/:id - Supprimer un chantier (admin uniquement)
router.delete('/:id', 
  restrictTo('admin'),
  chantierController.supprimerChantier
);

module.exports = router;