import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useUserRole from '../../hooks/useUserRole';

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [],
  adminOnly = false,
  technicianOnly = false,
  redirectTo = '/unauthorized'
}) => {
  const { isAuthenticated } = useAuthStore();
  const { isAdmin, isTechnician } = useUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  let hasAccess = false;
  
  if (adminOnly) {
    hasAccess = isAdmin;
  } else if (technicianOnly) {
    hasAccess = isTechnician;
  } else if (allowedRoles.length > 0) {
    hasAccess = allowedRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'technician') return isTechnician;
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
