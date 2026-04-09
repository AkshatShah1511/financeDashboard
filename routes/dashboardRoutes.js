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
/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get total income, expense and net balance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 *       403:
 *         description: Permission denied
 *
 * /api/dashboard/by-category:
 *   get:
 *     summary: Get totals grouped by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 *
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly income and expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends
 */