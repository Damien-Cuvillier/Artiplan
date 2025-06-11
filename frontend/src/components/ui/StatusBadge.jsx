// src/components/ui/StatusBadge.jsx
import React from 'react';

const statusConfig = {
  planifie: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Planifié'
  },
  en_cours: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'En cours'
  },
  termine: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Terminé'
  },
  suspendu: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Suspendu'
  },
  en_attente: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'En attente'
  }
};

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status || 'Inconnu'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;