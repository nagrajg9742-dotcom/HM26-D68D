const express = require("express");

const {
  assignComplaint,
  getAssignedComplaints
} = require("../controllers/assignmentController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/:id/assign",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  assignComplaint
);

router.get(
  "/assigned",
  authenticateToken,
  authorizeRoles("officer"),
  getAssignedComplaints
);

module.exports = router;
