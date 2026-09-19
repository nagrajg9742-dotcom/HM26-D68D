const express = require("express");

const {
  createRescueRequest
} = require("../controllers/rescueController");

const {
  authenticateToken
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/:id/rescue",
  authenticateToken,
  createRescueRequest
);

module.exports = router;