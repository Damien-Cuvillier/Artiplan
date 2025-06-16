// src/utils/catchAsync.js
export const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export par défaut pour la rétrocompatibilité
export default catchAsync;