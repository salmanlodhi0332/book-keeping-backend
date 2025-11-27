// ======================================================================
// OTP STORE (In-memory)
// ======================================================================

const otpStore = {};
const tempUserStore = {};

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Save OTP with purpose and expiry
 */
function saveOTP(email, otp, purpose) {
  console.log("Saving OTP =>", email, otp, purpose);

  otpStore[email] = {
    code: String(otp),
    purpose: String(purpose).trim(),
    expiresAt: Date.now() + OTP_EXPIRY,
  };
}

/**
 * Verify OTP with purpose validation
 */
function verifyOTP(email, otp, purpose) {
  otp = String(otp).trim();
  purpose = String(purpose).trim();

  const entry = otpStore[email];
  console.log("Verifying OTP =>", email, otp, purpose);

  if (!entry) {
    console.log("❌ No OTP found for email");
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    console.log("❌ OTP expired");
    delete otpStore[email];
    return false;
  }

  if (entry.code !== otp) {
    console.log("❌ OTP mismatch");
    return false;
  }

  if (entry.purpose !== purpose) {
    console.log("❌ OTP purpose mismatch");
    return false;
  }

  // OTP valid → delete
  delete otpStore[email];
  return true;
}

module.exports = {
  saveOTP,
  verifyOTP,
  tempUserStore,
};
