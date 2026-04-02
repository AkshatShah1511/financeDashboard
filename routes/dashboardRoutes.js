const express = require("express");
const { getSummary, getByCategory, getTrends } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("dashboard:read"));

router.get("/summary", getSummary);
router.get("/by-category", getByCategory);
router.get("/trends", getTrends);

module.exports = router;
