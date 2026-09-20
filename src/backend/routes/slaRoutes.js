const express = require("express");

const {
  setSlaDeadline,
  getOverdueComplaints
} = require("../controllers/slaController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  setSlaDeadline
);

router.get(
  "/overdue",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  getOverdueComplaints
);

module.exports = router;
