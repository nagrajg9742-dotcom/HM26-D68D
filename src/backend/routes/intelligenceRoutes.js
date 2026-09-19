const express = require("express");

const {
  healthEngine,
  riskPrediction,
  riskExplanation,
  rescueDetection,
  evidenceAssistance
} = require("../controllers/intelligenceController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/:id/health",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  healthEngine
);

router.get(
  "/:id/risk",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  riskPrediction
);

router.get(
  "/:id/risk/explanation",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  riskExplanation
);

router.get(
  "/:id/rescue",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  rescueDetection
);

router.get(
  "/:id/evidence",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  evidenceAssistance
);

module.exports = router;
