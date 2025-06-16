// src/utils/roles.js

export const ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician'
};

export const hasRole = (user, role) => {
  return user?.role === role;
};

export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

export const isTechnician = (user) => {
  return hasRole(user, ROLES.TECHNICIAN);
};

export const canEditChantier = (user) => {
  return isAdmin(user);
};

export const canDeleteChantier = (user) => {
  return isAdmin(user);
};

export const canEditIntervention = (user) => {
  return true; // Les techniciens peuvent modifier leurs interventions
};

export const canUpdateInterventionStatus = (user) => {
  return true; // Tous les utilisateurs peuvent mettre à jour le statut
};
