const { User, Store, Rating } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");


exports.createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                msg: "Password must be 8-16 chars, include 1 uppercase & 1 special char"
            });
        }
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            role
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { name, email, address, role, sortBy = "name", order = "ASC" } = req.query;

        let whereClause = {};

        if (name) {
            whereClause.name = { [Op.iLike]: `%${name}%` };
        }

        if (email) {
            whereClause.email = { [Op.iLike]: `%${email}%` };
        }

        if (address) {
            whereClause.address = { [Op.iLike]: `%${address}%` };
        }

        if (role) {
            whereClause.role = role;
        }

        const users = await User.findAll({
            where: whereClause,
            order: [[sortBy, order]],
            attributes: { exclude: ["password"] }
        });

        res.json(users);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ 3. GET SINGLE USER
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] },
            include: {
                model: Store,
                include: Rating
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ 4. CREATE STORE
exports.createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        const owner = await User.findByPk(owner_id);

        if (!owner) {
            return res.status(404).json({ msg: "Owner not found" });
        }

        if (owner.role !== "STORE_OWNER") {
            return res.status(400).json({
                msg: "User must be STORE_OWNER"
            });
        }


        const store = await Store.create({
            name,
            email,
            address,
            owner_id
        });

        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ 5. GET ALL STORES + AVG RATING
exports.getStores = async (req, res) => {
    try {
        const stores = await Store.findAll({
            include: [
                {
                    model: Rating,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        require("sequelize").fn("AVG", require("sequelize").col("Ratings.rating")),
                        "averageRating"
                    ]
                ]
            },
            group: ["Store.id"]
        });

        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ 6. DASHBOARD
exports.dashboard = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();

        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};