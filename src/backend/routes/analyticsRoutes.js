const express = require("express");

const {
  getAnalytics
} = require("../controllers/analyticsController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  getAnalytics
);

module.exports = router;