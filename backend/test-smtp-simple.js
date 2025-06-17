// test-smtp-simple.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testSMTP() {
  console.log('Configuration SMTP:');
  console.log('- Hôte:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- Utilisateur:', process.env.SMTP_USER);
  console.log('- Mot de passe:', process.env.SMTP_PASSWORD ? '***' : 'non défini');

  // Créer un transporteur SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    // Désactiver la vérification du certificat (pour les tests)
    tls: {
      rejectUnauthorized: false
    },
    // Activer le logging détaillé
    debug: true,
    logger: true
  });

  try {
    // Tester la connexion
    console.log('\nTest de connexion au serveur SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !');

    // Tester l'envoi d'email
    console.log('\nEnvoi d\'un email de test...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'test@example.com',  // Mailtrap ignorera cette adresse
      subject: 'Test de connexion SMTP',
      text: 'Ceci est un test de connexion SMTP réussi !',
      html: '<h1>Test réussi !</h1><p>Ceci est un test de connexion SMTP réussi !</p>'
    });

    console.log('✅ Email de test envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('\nAllez voir votre boîte Mailtrap pour voir l\'email reçu.');

  } catch (error) {
    console.error('\n❌ Erreur SMTP:');
    console.error('- Code:', error.code || 'N/A');
    console.error('- Message:', error.message);
    
    if (error.responseCode) {
      console.error('- Code de réponse:', error.responseCode);
    }
    if (error.response) {
      console.error('- Réponse:', error.response);
    }
    if (error.command) {
      console.error('- Commande échouée:', error.command);
    }
  }
}

testSMTP();