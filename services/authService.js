const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const { AppError, UnauthorizedError, ForbiddenError } = require("../utils/errors");
const jwt = require("jsonwebtoken");

const registerUser = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "viewer"
    }
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const loginUser = async (data) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === "inactive") {
    throw new ForbiddenError("Your account has been deactivated");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token };
};

module.exports = {
  registerUser,
  loginUser
};
