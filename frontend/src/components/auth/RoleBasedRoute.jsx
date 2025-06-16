import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAdmin, isTechnician } from '../../utils/roles';

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [],
  adminOnly = false,
  technicianOnly = false,
  redirectTo = '/unauthorized'
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  let hasAccess = false;
  
  if (adminOnly) {
    hasAccess = isAdmin(user);
  } else if (technicianOnly) {
    hasAccess = isTechnician(user);
  } else if (allowedRoles.length > 0) {
    hasAccess = allowedRoles.some(role => {
      if (role === 'admin') return isAdmin(user);
      if (role === 'technician') return isTechnician(user);
      return false;
    });
  } else {
    // Si aucun rôle spécifié, l'accès est autorisé
    hasAccess = true;
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export const AdminRoute = ({ children, ...props }) => (
  <RoleBasedRoute adminOnly {...props}>
    {children}
  </RoleBasedRoute>
);

export const TechnicianRoute = ({ children, ...props }) => (
  <RoleBasedRoute technicianOnly {...props}>
    {children}
  </RoleBasedRoute>
);
