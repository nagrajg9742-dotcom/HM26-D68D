const express = require("express");

const {
  createComplaint,
  getComplaints
} = require("../controllers/complaintController");

const {
  authenticateToken
} = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, createComplaint);
router.get("/", authenticateToken, getComplaints);

module.exports = router;