const { z } = require("zod");
const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name cannot contain numbers or symbols"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const register = asyncHandler(async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const newUser = await authService.registerUser(parseResult.data);
  return sendSuccess(res, newUser, 201);
});

const login = asyncHandler(async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const result = await authService.loginUser(parseResult.data);
  return sendSuccess(res, result, 200);
});

module.exports = {
  register,
  login
};
