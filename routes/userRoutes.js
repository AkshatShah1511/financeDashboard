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
