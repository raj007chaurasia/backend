const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  saveUser,
  toggleUserStatus,
  getPermissions,
  savePermissions
} = require("../../controllers/admin/admin.controller");

// ADMIN USER ROUTES
router.patch("/changeStatus/:id", toggleUserStatus);
router.post("/permission/save", savePermissions);
router.get("/permission", getPermissions);
router.post("/save", saveUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers);

module.exports = router;
