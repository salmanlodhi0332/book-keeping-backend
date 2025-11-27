// ======================================================================
// AUTH CONTROLLER (FINAL & FIXED)
// ======================================================================

const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");

const { generateOtpCode } = require("../utils/generateOtp");
const { saveOTP, verifyOTP, tempUserStore } = require("../utils/otpStore");

const User = db.User;

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";


// ======================================================================
// REGISTER → TEMP USER + OTP
// ======================================================================
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Already requested but not verified
    if (tempUserStore[email]) delete tempUserStore[email];

    // Generate OTP
    const otp = generateOtpCode(6);

    // Store temp user
    tempUserStore[email] = { name, email, phone, password };

    saveOTP(email, otp,"register");

    return res.json({
      success: true,
      message: "OTP has been sent. Please verify to complete registration.",
      otp, // ⚠️ remove in production
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// VERIFY OTP → REGISTRATION / FORGOT PASSWORD
// ======================================================================
exports.verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { email, otp, purpose } = req.body;
    console.log(`verifyOtp api email:${email}, ${otp}, ${purpose}}`)
    const otpCode = String(otp).trim();
    const isValid = verifyOTP(email, otpCode,purpose);
    if (!isValid)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // ----------------------------- REGISTER FLOW -----------------------------
    if (purpose === "register") {
      const data = tempUserStore[email];
      if (!data)
        return res.status(400).json({ message: "No registration data found" });

      const hashedPassword = await bcrypt.hash(data.password, 10);

      await User.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        isVerified: true,
      });

      delete tempUserStore[email];

      return res.json({
        success: true,
        message: "Registration successful! You can now log in.",
      });
    }

    // --------------------------- FORGOT PASSWORD FLOW ------------------------
    if (purpose === "forgot_password") {
      return res.json({
        success: true,
        message: "OTP verified. You can now reset your password.",
      });
    }

    return res.status(400).json({ message: "Invalid purpose" });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// LOGIN
// ======================================================================
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// FORGOT PASSWORD → SEND OTP
// ======================================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
console.log(email)
    const existing = await User.findOne({ where: { email } });

    // Always return true → security
    if (!existing) {
      return res.json({
        success: true,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = generateOtpCode(6);
    saveOTP(email, otp, "forgot_password");

    return res.json({
      success: true,
      message: "OTP sent successfully.",
      otp, // ⚠️ remove in production
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// RESET PASSWORD (AFTER VERIFY-OTP)
// ======================================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    console.error("RESET ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// UPDATE PROFILE
// ======================================================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      user,
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ======================================================================
// DELETE ACCOUNT
// ======================================================================
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.destroy();

    return res.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
