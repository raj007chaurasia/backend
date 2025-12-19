const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  saveUser,
  toggleUserStatus,
  getPermissionsByUserId,
  savePermissions
} = require("../controllers/admin.controller");

// ADMIN USER ROUTES
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/save", saveUser);
router.patch("/:id/status", toggleUserStatus);
router.get("/permission/get:userId", toggleUserStatus);
router.post("/permission/save", toggleUserStatus);

module.exports = router;
