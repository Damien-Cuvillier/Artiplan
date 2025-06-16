import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du dossier d'upload
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

// Filtre pour les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

// Configuration de Multer
export const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  }
});

// Middleware d'upload
export const uploadImage = [
  upload.single('image'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Aucun fichier téléchargé ou type de fichier non autorisé.'
      });
    }

    // Construire l'URL complète de l'image
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Définir les en-têtes CORS
    res.header('Access-Control-Allow-Origin', '*')
       .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
       .header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(200).json({
      status: 'success',
      data: {
        imageUrl,
        filename: req.file.filename
      }
    });
  }
];

// Supprimer une image
export const deleteImage = async (filePath) => {
  try {
    if (!filePath) return;
    
    // Extraire le nom du fichier du chemin
    const filename = path.basename(filePath);
    const fullPath = path.join(uploadDir, filename);
    
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      console.log(`Fichier supprimé : ${fullPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return false;
  }
};

// Nettoyage des uploads inutilisés
export const cleanupUploads = async (req, res, next) => {
  try {
    const files = await fs.promises.readdir(uploadDir);
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.promises.stat(filePath);
      
      // Supprimer les fichiers de plus de 7 jours
      if (Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
        await fs.promises.unlink(filePath);
        console.log(`Fichier nettoyé : ${filePath}`);
      }
    }
    
    next();
  } catch (error) {
    console.error('Erreur lors du nettoyage des uploads:', error);
    next(error);
  }
};