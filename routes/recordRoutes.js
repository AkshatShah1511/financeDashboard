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
