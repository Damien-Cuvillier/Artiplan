// src/models/Client.js
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: String,
  adresse: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: String
  },
  entreprise: String,
  siret: String,
  dateCreation: { type: Date, default: Date.now },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);
export default Client;