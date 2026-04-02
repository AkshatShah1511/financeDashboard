const prisma = require("../config/db");
const { AppError, NotFoundError } = require("../utils/errors");

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map(({ password, ...user }) => user);
};

const updateUser = async (id, data, currentUserId) => {
  if (id === currentUserId) {
    throw new AppError("You cannot update your own account", 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  // Check if trying to deactivate the last active admin
  if (data.status === "inactive" && targetUser.role === "admin" && targetUser.status === "active") {
    const activeAdminsCount = await prisma.user.count({
      where: {
        role: "admin",
        status: "active",
        id: { not: id } // Exclude the current target user
      }
    });

    if (activeAdminsCount === 0) {
      throw new AppError("Cannot deactivate the last active admin", 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

module.exports = {
  getAllUsers,
  updateUser
};
