const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const clientController = require('../controllers/clientController');

// Protection des routes
router.use(protect);
router.use(restrictTo('admin', 'gestionnaire'));

// Routes protégées
router.route('/')
  .get(clientController.getAllClients)
  .post(clientController.createClient);

router.route('/:id')
  .get(clientController.getClient)
  .patch(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;