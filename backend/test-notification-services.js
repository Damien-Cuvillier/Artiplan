import { sendEmail, testSMTP, notificationTemplates } from './src/services/notificationService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des variables d'environnement
const envPath = path.resolve(process.cwd(), '.env');
console.log('Chargement du .env depuis:', envPath);
dotenv.config({ path: envPath, override: true });

// Afficher les variables chargées
console.log('Variables SMTP chargées:', {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***' : 'non défini'
});

const runTests = async () => {
  console.log('\n=== TEST DU SERVICE DE NOTIFICATION ===\n');

  // Test de la connexion SMTP
  console.log('Test de la connexion SMTP...');
  const smtpTest = await testSMTP();
  if (!smtpTest) {
    console.error('❌ Le test SMTP a échoué');
    return;
  }

  // Test d'envoi d'email
  console.log('\nTest d\'envoi d\'email...');
  const testEmail = 'chantier.app.notifs@gmail.com';

  try {
    const template = notificationTemplates.NEW_INTERVENTION({
      chantierNom: 'Rénovation Immeuble Bellevue',
      type: 'Maintenance annuelle',
      dateDebut: new Date(),
      description: 'Contrôle des installations électriques et de plomberie',
      _id: '123'
    });
  
    const result = await sendEmail(
        testEmail,
        'NEW_INTERVENTION',
        {
          chantierNom: 'Rénovation Immeuble Bellevue',
          type: 'Maintenance annuelle',
          dateDebut: new Date(),
          description: 'Contrôle des installations électriques et de plomberie',
          _id: '123'
        }
      );
  
    console.log('✅ Email de test envoyé avec succès');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Échec de l\'envoi de l\'email');
    console.error('Erreur:', error);
  }
};

// Exécuter les tests
runTests().catch(console.error);