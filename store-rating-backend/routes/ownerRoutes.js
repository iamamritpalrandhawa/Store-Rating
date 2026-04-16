const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/ownerController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// 🔐 Only STORE_OWNER
router.get(
    "/dashboard",
    verifyToken,
    allowRoles("STORE_OWNER"),
    getDashboard
);

module.exports = router;