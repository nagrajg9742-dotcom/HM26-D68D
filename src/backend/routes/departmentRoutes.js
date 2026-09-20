const express = require("express");

const {
  getDepartments,
  createDepartment
} = require("../controllers/departmentController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("officer", "admin"),
  getDepartments
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createDepartment
);

module.exports = router;
