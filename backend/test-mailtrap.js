// test-mailtrap.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  // Forcer IPv4
  tls: {
    rejectUnauthorized: false
  },
  // Désactiver IPv6
  family: 4
});

// Options de l'email
const mailOptions = {
  from: process.env.SMTP_FROM,
  to: 'test@example.com',
  subject: 'Test de connexion SMTP avec Mailtrap',
  text: 'Ceci est un test de connexion SMTP avec Mailtrap',
  html: '<h1>Test réussi !</h1><p>Ceci est un test de connexion SMTP avec Mailtrap</p>'
};

// Envoyer l'email
console.log('Envoi de l\'email de test...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Erreur lors de l\'envoi de l\'email:');
    console.error('- Code:', error.code);
    console.error('- Message:', error.message);
    if (error.responseCode) {
      console.error('- Code de réponse:', error.responseCode);
    }
    if (error.response) {
      console.error('- Réponse:', error.response);
    }
  } else {
    console.log('Email envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
  }
});