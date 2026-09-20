const express = require("express");

const {
  getUsers,
  updateUserRole
} = require("../controllers/adminUserController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  getUsers
);

router.patch(
  "/users/:id/role",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserRole
);

module.exports = router;
