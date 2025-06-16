import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

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

export default router;