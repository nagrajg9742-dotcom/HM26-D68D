const express = require("express");

const {
  getStatusHistory
} = require("../controllers/statusHistoryController");

const {
  authenticateToken
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/:id/history",
  authenticateToken,
  getStatusHistory
);

module.exports = router;