const { ForbiddenError } = require("../utils/errors");

const PERMISSIONS = {
  viewer:  [],
  analyst: ["records:read", "dashboard:read"],
  admin:   ["records:read", "records:write", "dashboard:read", "users:manage"]
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const role = req.user.role;
    
    if (!PERMISSIONS[role] || !PERMISSIONS[role].includes(permission)) {
      throw new ForbiddenError("You don't have permission to perform this action");
    }
    
    next();
  };
};

module.exports = requirePermission;
