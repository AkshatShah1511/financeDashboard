const prisma = require("../config/db");

const logAction = async ({ action, resource, resourceId, performedBy }) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId,
        performedBy
      }
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};

module.exports = {
  logAction
};
