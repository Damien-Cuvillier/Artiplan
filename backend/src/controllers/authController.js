import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1) Vérifier si l'email et le mot de passe existent
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }
    
    // 2) Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // 3) Si tout est OK, envoyer le token
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );
    
    // Retirer le mot de passe de la sortie
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la connexion'
    });
  }
};
export const protect = async (req, res, next) => {
  try {
    let token;
    console.log('Headers:', req.headers); // Log des en-têtes
    console.log('Authorization header:', req.headers.authorization); // Log spécifique de l'en-tête d'autorisation

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('Aucun token fourni');
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
    }

    console.log('Token reçu:', token.substring(0, 20) + '...'); // Log des premiers caractères du token

    // 2) Vérifier le token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'votre-secret-par-defaut');
    } catch (jwtError) {
      console.error('Erreur lors de la vérification du token:', jwtError);
      return next(new AppError('Token invalide ou expiré. Veuillez vous reconnecter.', 401));
    }

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      console.log('Utilisateur non trouvé pour ce token');
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401));
    }

    // 4) Vérifier si l'utilisateur a changé de mot de passe après la création du token
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      console.log('Mot de passe modifié après la création du token');
      return next(new AppError('L\'utilisateur a récemment changé de mot de passe. Veuillez vous reconnecter.', 401));
    }

    // ACCÈS AUTORISÉ
    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Erreur dans le middleware protect:', err);
    return next(new AppError('Erreur d\'authentification. Veuillez vous reconnecter.', 401));
  }
};