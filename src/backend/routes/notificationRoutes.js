const express = require("express");

const {
  getNotifications,
  markNotificationAsRead
} = require("../controllers/notificationController");

const {
  authenticateToken
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getNotifications
);

router.patch(
  "/:id/read",
  authenticateToken,
  markNotificationAsRead
);

module.exports = router;