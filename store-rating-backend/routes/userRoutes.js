const express = require("express");
const router = express.Router();

const {
    updatePassword,
    getStores,
    submitRating
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");

// 🔐 All logged users
router.use(verifyToken);

router.put("/update-password", updatePassword);

router.get("/stores", getStores);

router.post("/ratings", submitRating);

module.exports = router;