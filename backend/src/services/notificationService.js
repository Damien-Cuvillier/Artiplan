// backend/src/services/notificationService.js
import nodemailer from 'nodemailer';
import Chantier from '../models/Chantier.js';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Templates de notification
const notificationTemplates = {
    NEW_INTERVENTION: (data) => ({
      subject: `Nouvelle intervention - ${data.chantierNom}`,
      text: `Nouvelle intervention planifiée :
        - Chantier: ${data.chantierNom}
        - Date: ${new Date(data.dateDebut).toLocaleDateString('fr-FR')}
        - Type: ${data.type || 'Non spécifié'}
        - Description: ${data.description || 'Aucune description'}`,
      html: `
        <h2>Nouvelle intervention planifiée</h2>
        <p><strong>Chantier:</strong> ${data.chantierNom}</p>
        <p><strong>Date:</strong> ${new Date(data.dateDebut).toLocaleDateString('fr-FR')}</p>
        <p><strong>Type:</strong> ${data.type || 'Non spécifié'}</p>
        ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}`
    }),
    INTERVENTION_UPDATED: (data) => ({
      subject: `Mise à jour d'intervention - ${data.chantierNom}`,
      text: `L'intervention a été mise à jour :
        - Chantier: ${data.chantierNom}
        - Statut: ${data.statut}
        - Modifications: ${data.changes.join(', ')}`,
      html: `
        <h2>Intervention mise à jour</h2>
        <p><strong>Chantier:</strong> ${data.chantierNom}</p>
        <p><strong>Statut:</strong> ${data.statut}</p>
        <p><strong>Modifications:</strong> ${data.changes.join(', ')}</p>`
    })
  };

// Envoyer un email
const sendEmail = async (to, template, data) => {
    try {
      const { subject, text, html } = template(data);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html
      });
      console.log(`Email envoyé à ${to}`);
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  };

// Envoyer une notification à un utilisateur
const sendUserNotification = async (user, type, data) => {
  const { notifications } = user;
  if (!notifications) return false;

  const template = notificationTemplates[type];
  if (!template) {
    console.error(`Template de notification inconnu: ${type}`);
    return false;
  }

  let sent = false;

  // Envoyer par email si activé
  if (notifications.email?.enabled && user.email) {
    const emailSent = await sendEmail(user.email, template.email, data);
    sent = sent || emailSent;
  }

  return sent;
};

// Notifier les utilisateurs concernés par une intervention
const notifyInterventionUsers = async (intervention, type, changes = []) => {
    try {
      const chantier = await Chantier.findById(intervention.chantier_id)
        .populate('responsables', 'email notifications')
        .populate('client_id', 'email notifications');
  
      if (!chantier) {
        console.error('Chantier non trouvé pour la notification');
        return false;
      }
  
      const notificationData = {
        ...intervention.toObject(),
        chantierNom: chantier.titre || 'Sans nom',
        changes
      };
  
      const usersToNotify = [
        ...chantier.responsables,
        chantier.client_id
      ].filter(Boolean);
  
      const results = await Promise.all(
        usersToNotify.map(async (user) => {
          if (!user.notifications?.email?.enabled) return false;
          return sendEmail(user.email, notificationTemplates[type], notificationData);
        })
      );
  
      return results.some(Boolean);
    } catch (error) {
      console.error('Erreur notification:', error);
      return false;
    }
  };

// Fonction principale pour envoyer des notifications
// Interface du service
const sendNotification = {
    async newIntervention(intervention) {
      return notifyInterventionUsers(intervention, 'NEW_INTERVENTION');
    },
    async interventionUpdated(intervention, changes) {
      return notifyInterventionUsers(intervention, 'INTERVENTION_UPDATED', changes);
    }
  };

export default sendNotification;