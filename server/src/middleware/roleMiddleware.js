export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated user'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next;
    next();
  };
};

/**
 * Validates whether the user has permission to transition the initiative stage
 */
export const checkStageTransitionPermission = (user, initiative) => {
  if (user.role === 'Admin') return { allowed: true };

  if (user.role === 'Department_Lead') {
    const isAuthorDept = user.department === initiative.department;
    const isImpactedDept = Array.isArray(initiative.impacted_departments) &&
      initiative.impacted_departments.includes(user.department);

    if (isAuthorDept || isImpactedDept) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Department Leads can only approve or transition initiatives that impact their designated department (${user.department}).`
    };
  }

  // Analyst role cannot perform stage transitions
  return {
    allowed: false,
    reason: 'Analysts do not hold governance authority to transition workflow stages. Department_Lead or Admin approval required.'
  };
};

