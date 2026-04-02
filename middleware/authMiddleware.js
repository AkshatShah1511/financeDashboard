const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Authentication required");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Invalid token format");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  if (user.status === "inactive") {
    throw new ForbiddenError("Your account has been deactivated");
  }

  const { password, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;

  next();
});

module.exports = authMiddleware;
