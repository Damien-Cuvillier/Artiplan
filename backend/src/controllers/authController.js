const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
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
      { id: user._id.toString() }, // Assurez-vous que l'ID est une chaîne
      process.env.JWT_SECRET, // Fournissez une valeur par défaut
      
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
exports.protect = async (req, res, next) => {
  try {
    // 1) Vérifier si le token existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
    }

    // 2) Vérifier le token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401));
    }

    // 4) Vérifier si l'utilisateur a changé de mot de passe après la création du token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('L\'utilisateur a récemment changé de mot de passe. Veuillez vous reconnecter.', 401));
    }

    // ACCÈS AUTORISÉ
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette ressource.', 401));
  }
};