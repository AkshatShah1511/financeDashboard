const express = require("express");
const { AppError } = require("./utils/errors");
const { sendError } = require("./utils/response");
const { ZodError } = require("zod");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Finance Dashboard API",
    version: "1.0.0",
    docs: "https://financedashboard-production-1009.up.railway.app/api-docs"
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new AppError("Invalid JSON in request body", 400);
    }
  }
}));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, "Invalid JSON in request body", 400);
  }
  next(err);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.all("*", (req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err.code === "P2002") {
    return sendError(res, "A record with this value already exists", 400);
  }
  if (err.code === "P2025") {
    return sendError(res, "Resource not found", 404);
  }
  if (err.code === "P2003") {
    return sendError(res, "Invalid reference", 400);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Session expired, please login again", 401);
  }

  if (err instanceof ZodError) {
    return sendError(res, err.errors[0].message, 422);
  }

  console.error("Unhandled Error:", err);
  return sendError(res, "Something went wrong, please try again", 500);
});

module.exports = app;