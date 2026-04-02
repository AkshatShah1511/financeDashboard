const { z } = require("zod");
const userService = require("../services/userService");
const auditService = require("../services/auditService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { ValidationError, AppError } = require("../utils/errors");

const updateSchema = z.object({
  role: z.enum(["viewer", "analyst", "admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional()
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return sendSuccess(res, users, 200);
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Whitelist: only allow role and status, ignore others completely
  const dataToUpdate = {};
  if (req.body.role !== undefined) dataToUpdate.role = req.body.role;
  if (req.body.status !== undefined) dataToUpdate.status = req.body.status;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError("No valid fields provided to update", 400);
  }

  const parseResult = updateSchema.safeParse(dataToUpdate);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const updatedUser = await userService.updateUser(id, parseResult.data, req.user.id);

  // Log to AuditLog
  await auditService.logAction({
    action: "updated",
    resource: "user",
    resourceId: updatedUser.id,
    performedBy: req.user.id
  });

  return sendSuccess(res, updatedUser, 200);
});

module.exports = {
  getUsers,
  updateUser
};
