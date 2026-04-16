const express = require("express");
const router = express.Router();

const {
    createUser,
    getUsers,
    getUserById,
    createStore,
    getStores,
    dashboard
} = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// 🔐 All routes ADMIN only
router.use(verifyToken, allowRoles("ADMIN"));

router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);

router.post("/stores", createStore);
router.get("/stores", getStores);

router.get("/dashboard", dashboard);

module.exports = router;