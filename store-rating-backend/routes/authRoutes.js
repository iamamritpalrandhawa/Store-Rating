const express = require("express");
const router = express.Router();
const { signup, login, forgotPassword, resetPassword, verifyOtp } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;