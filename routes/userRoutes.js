const express = require("express");
const { getUsers, updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("users:manage"));

router.get("/", getUsers);
router.patch("/:id", updateUser);

module.exports = router;
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user role or status
 *     tags: [Users]
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
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Cannot update your own account
 *       404:
 *         description: User not found
 */