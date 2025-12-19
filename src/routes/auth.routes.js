const express = require("express");
const router = express.Router();

const {
  userRegister,
  userLogin,
  adminLogin
} = require("../controllers/auth.controller");

// USER REGISTRATION
router.post("/user/register", userRegister);

// USER LOGIN
router.post("/user/login", userLogin);

// ADMIN LOGIN
router.post("/admin/login", adminLogin);

module.exports = router;
