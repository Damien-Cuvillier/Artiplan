// backend/test-email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function testEmail() {
  // Configuration du transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Options de l'email
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER, // Envoyer à vous-même pour le test
    subject: 'Test d\'envoi d\'email - Chantier App',
    text: 'Ceci est un email de test envoyé depuis votre application Chantier.',
    html: `
      <h1>Test d'envoi d'email</h1>
      <p>Ceci est un email de test envoyé depuis votre application Chantier.</p>
      <p>Si vous recevez ce message, la configuration SMTP est correcte ! 🎉</p>
    `
  };

  try {
    console.log('Envoi du mail de test...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:');
    console.error(error);
  }
}

// Exécuter le test
testEmail();