const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  saveUser,
  toggleUserStatus,
  getPermissionsByUserId,
  savePermissions
} = require("../../controllers/admin/admin.controller");

// ADMIN USER ROUTES
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/save", saveUser);
router.patch("/changeStatus/:id", toggleUserStatus);
router.get("/permission/get/:userId", getPermissionsByUserId);
router.post("/permission/save", savePermissions);
router.post("/permission/save/:userId", savePermissions);

module.exports = router;
