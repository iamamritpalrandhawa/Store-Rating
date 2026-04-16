const bcrypt = require("bcryptjs");
const { User, Store, Rating } = require("../models");
const { Op, fn, col } = require("sequelize");


// ✅ Update Password
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Old password incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ msg: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ✅ Get Stores (with avgRating + userRating)
exports.getStores = async (req, res) => {
    try {
        const { search } = req.query;
        const userId = req.user.id;

        let where = {};

        if (search) {
            where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { address: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const stores = await Store.findAll({
            where,
            include: [
                {
                    model: Rating,
                    attributes: ["rating", "userId"]
                }
            ]
        });

        const formatted = stores.map((store) => {
            const ratings = store.Ratings || [];

            const avgRating =
                ratings.length > 0
                    ? (
                        ratings.reduce((sum, r) => sum + r.rating, 0) /
                        ratings.length
                    ).toFixed(1)
                    : null;

            const userRating =
                ratings.find((r) => r.userId === userId)?.rating || null;

            return {
                id: store.id,
                name: store.name,
                address: store.address,
                avgRating,
                userRating
            };
        });

        res.json(formatted);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ✅ Submit / Update Rating
exports.submitRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { store_id, rating } = req.body;

        // 🔒 validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: "Rating must be between 1 and 5" });
        }

        // ❌ REMOVE this (wrong place for index)
        // indexes should be defined in model, not query

        let existing = await Rating.findOne({
            where: { userId, storeId: store_id }
        });

        if (existing) {
            existing.rating = rating;
            await existing.save();

            return res.json({ msg: "Rating updated", data: existing });
        }

        const newRating = await Rating.create({
            userId,
            storeId: store_id,
            rating
        });

        res.status(201).json({ msg: "Rating submitted", data: newRating });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};