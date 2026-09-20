const express = require("express");

const {
  createVerificationRequest,
  respondToVerificationRequest
} = require("../controllers/verificationController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/:id/verification",
  authenticateToken,
  createVerificationRequest
);

router.patch(
  "/:id/verification",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  respondToVerificationRequest
);

module.exports = router;
