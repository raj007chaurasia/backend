const express = require("express");
const router = express.Router();

const { userRegister, userLogin, sendOtp, verifyOtpAndChangePassword } = require("../controllers/auth.controller");
const { adminLogin } = require("../controllers/admin/admin.controller");

// USER REGISTRATION
router.post("/user/register", userRegister);

// USER LOGIN
router.post("/user/login", userLogin);

// FORGOT PASSWORD - SEND OTP
router.post("/user/forgot-password", sendOtp);

// FORGOT PASSWORD - VERIFY OTP & RESET PASSWORD
router.post("/user/reset-password", verifyOtpAndChangePassword);

// ADMIN LOGIN
router.post("/admin/login", adminLogin);

module.exports = router;
