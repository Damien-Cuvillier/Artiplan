import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utils/roles';

const useUserRole = () => {
  const { user } = useAuthStore();

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  };

  const isAdmin = hasRole(ROLES.ADMIN);
  const isTechnician = hasRole(ROLES.TECHNICIAN);

  const canEditChantier = isAdmin;
  const canDeleteChantier = isAdmin;
  const canEditIntervention = isAdmin || isTechnician;
  const canDeleteIntervention = isAdmin;
  const canChangeInterventionStatus = isAdmin || isTechnician;

  return {
    hasRole,
    isAdmin,
    isTechnician,
    canEditChantier,
    canDeleteChantier,
    canEditIntervention,
    canDeleteIntervention,
    canChangeInterventionStatus,
  };
};

export default useUserRole;
