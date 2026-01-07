const bcrypt = require("bcrypt");
const { User, UserOtp } = require("../models");
const { generateToken } = require("../config/jwt");

/**
 * USER LOGIN
 */
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken({ id: user.id, role: "User" });

    return res.status(200).json({ success: true, message: "User login successful", token });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * USER REGISTRATION
 */
exports.userRegister = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(409).json({ success: false, message: "User already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword, mobile, });

    return res.status(201).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * SEND OTP (WHATSAPP)
 */
exports.sendOtp = async (req, res) => {
  const { phoneNo } = req.body;

  // Map phoneNo from request to mobile column in DB
  const user = await User.findOne({ where: { mobile: phoneNo } });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // FIX: Explicitly set isUsed: false to avoid NULL values in DB
  await UserOtp.create({ 
    userId: user.id, 
    otp, 
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    isUsed: false 
  });

  // 🔴 WhatsApp API Integration Placeholder
  console.log(`Send OTP ${otp} to WhatsApp ${phoneNo}`);

  return res.status(200).json({ success: true, message: "OTP sent successfully", otp });
};

/**
 * VERIFY OTP & CHANGE PASSWORD
 */
exports.verifyOtpAndChangePassword = async (req, res) => {
  const { phoneNo, otp, newPassword } = req.body;

  console.log(`Verifying OTP for ${phoneNo} with OTP: ${otp}`);

  // Map phoneNo from request to mobile column in DB
  const user = await User.findOne({ where: { mobile: phoneNo } });
  if (!user) {
    console.log("User not found during OTP verification");
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Debugging: Check if any OTP exists for this user, ignoring isUsed/expiry first
  const debugOtp = await UserOtp.findOne({ where: { userId: user.id, otp } });
  if (debugOtp) {
    console.log(`Found OTP record. isUsed: ${debugOtp.isUsed}, expiresAt: ${debugOtp.expiresAt}, Now: ${new Date()}`);
  } else {
    console.log("No OTP record found matching userId and otp string");
  }

  const otpRecord = await UserOtp.findOne({
    where: {
      userId: user.id,
      otp,
      isUsed: false
    }
  });

  if (!otpRecord) {
    console.log("OTP verification failed: Record not found or already used");
    return res.status(400).json({ success: false, message: "Invalid or used OTP" });
  }

  if (otpRecord.expiresAt < new Date()) {
    console.log("OTP verification failed: OTP expired");
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  otpRecord.isUsed = true;
  await otpRecord.save();

  console.log("Password changed successfully");
  return res.status(200).json({ success: true, message: "Password changed successfully" });
};