const express = require("express");
const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
} = require("../controllers/recordController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", requirePermission("records:write"), createRecord);
router.get("/", requirePermission("records:read"), getRecords);
router.patch("/:id", requirePermission("records:write"), updateRecord);
router.delete("/:id", requirePermission("records:write"), deleteRecord);

module.exports = router;
/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: salary
 *               date:
 *                 type: string
 *                 example: "2024-01-15"
 *               notes:
 *                 type: string
 *                 example: "January salary"
 *     responses:
 *       200:
 *         description: Record created successfully
 *       403:
 *         description: Permission denied
 *       422:
 *         description: Validation error
 *
 *   get:
 *     summary: Get all records with optional filters
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2024-03-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of records
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       404:
 *         description: Record not found
 *
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 */