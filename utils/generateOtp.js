// utils/generateOtp.js
function generateOtpCode(length = 6) {
    // numeric OTP
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }
  
  module.exports = { generateOtpCode };
  