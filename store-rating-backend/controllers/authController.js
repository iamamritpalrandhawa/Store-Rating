const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendEmail } = require("../utils/emailService");

// 🔢 OTP GENERATOR
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        const cleanedEmail = email.trim().toLowerCase();

        const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                msg: "Password must be 8-16 chars, include 1 uppercase & 1 special char"
            });
        }

        const existing = await User.findOne({ where: { email: cleanedEmail } });

        const otp = generateOTP();

        let userRole = "USER";
        if (role === "STORE_OWNER") userRole = "STORE_OWNER";

        // 🔥 CASE 1: Already verified
        if (existing && existing.isVerified) {
            return res.status(400).json({
                msg: "Email already registered"
            });
        }

        // 🔥 CASE 2: Exists but NOT verified → UPDATE + RESEND OTP
        if (existing && !existing.isVerified) {
            const hashedPassword = await bcrypt.hash(password, 10);

            existing.name = name;
            existing.password = hashedPassword;
            existing.address = address;
            existing.role = userRole;
            existing.otp = otp;
            existing.otpExpiry = Date.now() + 10 * 60 * 1000;

            await existing.save();

            await sendEmail({
                to: cleanedEmail,
                subject: "OTP Verification",
                html: `<p>Your OTP is: <b>${otp}</b></p>`
            });

            return res.json({
                msg: "OTP resent. Please verify your account",
                needVerification: true
            });
        }

        // 🔥 CASE 3: NEW USER
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: cleanedEmail,
            password: hashedPassword,
            address,
            role: userRole,
            otp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });

        await sendEmail({
            to: cleanedEmail,
            subject: "OTP Verification",
            html: `<p>Your OTP is: <b>${otp}</b></p>`
        });

        res.json({
            msg: "OTP sent to email",
            needVerification: true
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.otp !== otp) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ msg: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.json({ msg: "Account verified" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const cleanedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ where: { email: cleanedEmail } });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // 🔥 If NOT VERIFIED → resend OTP
        if (!user.isVerified) {
            const otp = generateOTP();

            user.otp = otp;
            user.otpExpiry = Date.now() + 10 * 60 * 1000;

            await user.save();

            // 📧 Send OTP
            await sendEmail({
                to: cleanedEmail,
                subject: "Verify your account",
                html: `<p>Your OTP is: <b>${otp}</b></p>`
            });

            return res.status(403).json({
                msg: "Account not verified. OTP sent to email.",
                needVerification: true
            });
        }

        // ✅ Password check
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // 🔐 Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const { password: _, ...userData } = user.toJSON();

        res.json({ token, user: userData });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ msg: "User not found" });

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendEmail({
            to: email,
            subject: "Reset OTP",
            html: `<p>Your OTP is: <b>${otp}</b></p>`
        });

        res.json({ msg: "OTP sent" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                msg: "Weak password"
            });
        }


        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.otp !== otp) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ msg: "OTP expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.json({ msg: "Password reset successful" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};