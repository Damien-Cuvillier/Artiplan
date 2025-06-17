// test-notifications.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { notificationTemplates, sendEmail } from './src/services/notificationService.js';

// Configurer __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Données de test
const testData = {
  NEW_INTERVENTION: {
    chantierNom: "Rénovation Immeuble Bellevue",
    dateDebut: new Date(),
    type: "Maintenance annuelle",
    description: "Contrôle des installations électriques et de plomberie",
    _id: "123abc456def"
  },
  INTERVENTION_UPDATED: {
    chantierNom: "Rénovation Immeuble Bellevue",
    statut: "en_cours",
    changes: [
      "Statut changé de 'planifiée' à 'en cours'",
      "Date de début mise à jour",
      "Technicien assigné modifié"
    ],
    _id: "123abc456def"
  }
};

async function testNotification(type) {
  try {
    console.log(`\n=== Test de notification: ${type} ===`);
    
    // Récupérer le template
    const template = notificationTemplates[type];
    if (!template) {
      throw new Error(`Type de notification inconnu: ${type}`);
    }
    
    // Générer le contenu
    const emailContent = template(testData[type]);
    
    console.log('\nSujet:', emailContent.subject);
    console.log('\nVersion texte:');
    console.log(emailContent.text);
    
    // Envoyer l'email
    console.log('\nEnvoi en cours...');
    await sendEmail(
      process.env.SMTP_USER,  // Envoyer à vous-même
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );
    
    console.log('✅ Email envoyé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter les tests
async function runTests() {
  console.log('=== DÉBUT DES TESTS DE NOTIFICATION ===');
  
  // Tester la notification de nouvelle intervention
  await testNotification('NEW_INTERVENTION');
  
  // Attendre 2 secondes
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Tester la notification de mise à jour
  await testNotification('INTERVENTION_UPDATED');
  
  console.log('\n=== TESTS TERMINÉS ===');
}

runTests().catch(console.error);