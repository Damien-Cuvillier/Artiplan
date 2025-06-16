import Client from '../models/Client.js';

/**
 * Créer un nouveau client
 * @route POST /api/clients
 * @access Privé (Admin/Gestionnaire)
 */
export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json({
      status: 'success',
      data: { client }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création du client',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Obtenir tous les clients
 * @route GET /api/clients
 * @access Privé
 */
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ nom: 1 });
    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: { clients }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des clients',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Obtenir un client par son ID
 * @route GET /api/clients/:id
 * @access Privé
 */
export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun client trouvé avec cet ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { client }
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        status: 'fail',
        message: 'ID de client invalide'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du client',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Mettre à jour un client
 * @route PATCH /api/clients/:id
 * @access Privé (Admin/Gestionnaire)
 */
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true 
      }
    );
    
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun client trouvé avec cet ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { client }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Erreur de validation',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du client',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Supprimer un client
 * @route DELETE /api/clients/:id
 * @access Privé (Admin)
 */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun client trouvé avec cet ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression du client',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Export par défaut pour la rétrocompatibilité
export default {
  createClient,
  getAllClients,
  getClient,
  updateClient,
  deleteClient
};