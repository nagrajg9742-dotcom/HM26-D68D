const express = require("express");

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus
} = require("../controllers/complaintController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, createComplaint);
router.get("/", authenticateToken, getComplaints);
router.get("/:id", authenticateToken, getComplaintById);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  updateComplaintStatus
);

module.exports = router;