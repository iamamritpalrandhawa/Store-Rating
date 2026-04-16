const { Store, Rating, User } = require("../models");
const { fn, col } = require("sequelize");


// ✅ Owner Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // 👉 Find store of this owner
        const store = await Store.findOne({
            where: { owner_id: ownerId }
        });

        if (!store) {
            return res.status(404).json({ msg: "Store not found" });
        }

        // 👉 Get ratings + users
        const ratings = await Rating.findAll({
            where: { storeId: store.id },
            include: {
                model: User,
                attributes: ["id", "name", "email"]
            }
        });

        // 👉 Calculate average rating
        const avg = await Rating.findOne({
            where: { storeId: store.id },
            attributes: [
                [fn("AVG", col("rating")), "averageRating"]
            ]
        });

        res.json({
            store,
            averageRating: avg.dataValues.averageRating || 0,
            ratings
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};