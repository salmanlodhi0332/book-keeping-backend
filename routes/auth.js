const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// REGISTER
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").optional().isString(),
  ],
  authController.register
);

// VERIFY OTP
router.post(
  "/verify-otp",
  [
    body("email").isEmail(),
    body("otp").isLength({ min: 6 }),
    body("purpose").isIn(["register", "forgot_password"]),
  ],
  authController.verifyOtp
);

// LOGIN
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  authController.login
);

// FORGOT PASSWORD → REQUEST OTP
router.post("/forgot-password", [body("email").isEmail()], authController.forgotPassword);

// RESET PASSWORD
router.post(
  "/reset-password",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  authController.resetPassword
);

// UPDATE PROFILE
router.patch("/update-profile", authMiddleware, authController.updateProfile);

// DELETE ACCOUNT
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
