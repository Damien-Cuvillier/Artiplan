const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nom: String,
  prenom: String,
  role: { type: String, enum: ['admin', 'gestionnaire', 'technicien'], default: 'technicien' },
  telephone: String,
  poste: String,
  date_embauche: Date,
  actif: { type: Boolean, default: true }
}, { timestamps: true });

// Hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

module.exports = mongoose.model('User', userSchema);