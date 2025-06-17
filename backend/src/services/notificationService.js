// backend/src/services/notificationService.js
import nodemailer from 'nodemailer';
import Chantier from '../models/Chantier.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = path.resolve(process.cwd(), '.env');
console.log('Chargement du .env depuis:', envPath);
dotenv.config({ path: envPath, override: true });

// Formateur de date simple
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formateur d'heure simple
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  // Forcer l'utilisation d'IPv4
  tls: {
    rejectUnauthorized: false,
    // Désactiver la vérification du nom d'hôte
    servername: 'smtp.gmail.com'
  },
  // Désactiver IPv6
  family: 4,
  // Désactiver la mise en cache DNS
  dns: {
    ttl: 0,
    maxCachedSessions: 0
  }
});

// Vérifier la connexion SMTP au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de connexion SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à envoyer des emails');
  }
});

// Templates de notification
const notificationTemplates = {
  NEW_INTERVENTION: (data) => {
    const date = new Date(data.dateDebut);
    const dateStr = formatDate(date);
    const timeStr = formatTime(date);

    return {
      subject: `📅 Nouvelle intervention - ${data.titre}`,
      text: `Nouvelle intervention planifiée :

Titre: ${data.titre}
Chantier: ${data.chantierNom}
Date: ${dateStr} à ${timeStr}
${data.duree ? `Durée estimée: ${data.duree} heures` : ''}
${data.prix ? `Prix: ${data.prix}€` : ''}
${data.description ? `Description: ${data.description}` : ''}

Cordialement,
L'équipe Chantier App`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nouvelle intervention planifiée</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">${data.titre}</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">Chantier: ${data.chantierNom}</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong>📅 Date :</strong> ${dateStr} à ${timeStr}
              </p>
              ${data.duree ? `
                <p style="margin: 10px 0;">
                  <strong>⏱️ Durée estimée :</strong> ${data.duree} heures
                </p>
              ` : ''}
              ${data.prix ? `
                <p style="margin: 10px 0;">
                  <strong>💰 Prix :</strong> ${data.prix}€
                </p>
              ` : ''}
              ${data.description ? `
                <div style="margin: 15px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                  <p style="margin: 0; font-style: italic;"><strong>Description :</strong> ${data.description}</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2025 Chantier App. Tous droits réservés.</p>
          </div>
        </div>
      `
    };
  },

  INTERVENTION_UPDATED: (data) => {
    const statusColors = getStatusColor(data.statut);
    
    return {
      subject: `🔄 Mise à jour - ${data.chantierNom}`,
      text: `L'intervention a été mise à jour :

Chantier: ${data.chantierNom}
Statut: ${data.statut}
Modifications: ${data.changes.join('\n- ')}

Pour plus de détails, connectez-vous à votre espace client :
${process.env.FRONTEND_URL}

Cordialement,
L'équipe Chantier App`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Intervention mise à jour</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">${data.chantierNom}</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong>🔄 Statut :</strong> 
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; 
                             background-color: ${statusColors.bg}; 
                             color: ${statusColors.text};">
                  ${data.statut}
                </span>
              </p>
              
              <div style="margin: 15px 0; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">Modifications :</p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${data.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2025 Chantier App. Tous droits réservés.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/settings/notifications" 
                 style="color: #6b7280; text-decoration: none;">
                Gérer mes préférences
              </a>
            </p>
          </div>
        </div>
      `
    };
  }
};

// Helper function pour les couleurs de statut
function getStatusColor(status) {
  const colors = {
    planifiee: { bg: '#dbeafe', text: '#1e40af' },
    en_cours: { bg: '#fef3c7', text: '#92400e' },
    terminee: { bg: '#dcfce7', text: '#166534' },
    annulee: { bg: '#fee2e2', text: '#991b1b' }
  };
  return colors[status.toLowerCase()] || { bg: '#e5e7eb', text: '#1f2937' };
}
// Envoyer un email
const sendEmail = async (to, templateName, data) => {
  try {
    const template = notificationTemplates[templateName](data);
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    });
    
    console.log('Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Tester la connexion SMTP
const testSMTP = async () => {
  try {
    await transporter.verify();
    console.log('Connexion SMTP réussie');
    return true;
  } catch (error) {
    console.error('Erreur de connexion SMTP:', error);
    return false;
  }
};

export {
  notificationTemplates,
  testSMTP,
  sendEmail
};

export default {
  notificationTemplates,
  testSMTP,
  sendEmail
};