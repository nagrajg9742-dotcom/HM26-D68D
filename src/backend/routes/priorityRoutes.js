const express = require("express");

const {
  getPriorityQueue
} = require("../controllers/priorityController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  getPriorityQueue
);

module.exports = router;
