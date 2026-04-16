const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,      // your gmail
        pass: process.env.EMAIL_PASS       // app password (NOT gmail password)
    }
});

exports.sendEmail = async ({ to, subject, html }) => {
    try {

        const response = await transporter.sendMail({
            from: `"Store App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

    } catch (error) {
        console.error("❌ Email Error:", error.message);
    }
};