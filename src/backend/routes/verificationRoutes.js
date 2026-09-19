const express = require("express");

const {
  createVerificationRequest
} = require("../controllers/verificationController");

const {
  authenticateToken
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/:id/verification",
  authenticateToken,
  createVerificationRequest
);

module.exports = router;
