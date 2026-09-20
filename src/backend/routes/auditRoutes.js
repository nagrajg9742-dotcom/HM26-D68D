const express = require("express");

const {
  getAuditLogs
} = require("../controllers/auditController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAuditLogs
);

module.exports = router;
