import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Upload d'une nouvelle image
router.post('/image', protect, uploadImage);

// Suppression d'une image
router.delete('/image', protect, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        status: 'error',
        message: 'Le chemin du fichier est requis'
      });
    }

    const success = await deleteImage(filePath);
    
    if (success) {
      return res.json({
        status: 'success',
        message: 'Fichier supprimé avec succès'
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Fichier non trouvé ou erreur lors de la suppression'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
});

export default router;