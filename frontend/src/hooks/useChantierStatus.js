// src/hooks/useChantierStatus.js
import { useMemo } from 'react';

const isDateInFuture = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
};

export const useChantierStatus = (chantier) => {
  return useMemo(() => {
    if (!chantier) return 'inconnu';

    // Si le chantier est terminé
    if (chantier.statut === 'termine' || chantier.progression >= 100) {
      return 'termine';
    }
    
    // Si le chantier est dans les priorités urgentes
    if (['urgent', 'high', 'critique'].includes(chantier.priorite?.toLowerCase())) {
      return 'en_cours';
    }
    
    // Si le chantier est en attente mais que la date de début est passée
    if (chantier.statut === 'en_attente' && chantier.date_debut && !isDateInFuture(chantier.date_debut)) {
      return 'en_cours';
    }
    
    // Si le chantier est en attente avec date future
    if (chantier.statut === 'en_attente' && (!chantier.date_debut || isDateInFuture(chantier.date_debut))) {
      return 'planifie';
    }
    
    // Par défaut, retourner le statut actuel
    return chantier.statut || 'inconnu';
  }, [chantier]);
};