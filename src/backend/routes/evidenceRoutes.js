const express = require("express");

const {
  uploadEvidence,
  getEvidence
} = require("../controllers/evidenceController");

const {
  authenticateToken
} = require("../middleware/auth");

const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/backend/uploads/evidence");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1E9)}` +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage
});

router.post(
  "/:id",
  authenticateToken,
  upload.single("evidence"),
  uploadEvidence
);

router.get(
  "/:id",
  authenticateToken,
  getEvidence
);

module.exports = router;