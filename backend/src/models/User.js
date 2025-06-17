import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Dans backend/src/models/User.js
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  telephone: { type: String },
  entreprise: { type: String },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      newIntervention: { type: Boolean, default: true },
      chantierUpdated: { type: Boolean, default: true },
      deadlineReminder: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false }
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      all: { type: Boolean, default: true }
    },
    reminders: {
      beforeDeadline: { type: Number, default: 24 }, // en heures
      dailyDigest: { type: String, default: '08:00' },
      timezone: { type: String, default: 'Europe/Paris' }
    }
  }
}, { timestamps: true });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Générer un token JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const User = mongoose.model('User', userSchema);
export default User;