const sequelize = require("../config/db");

const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");

// ✅ Rating Relations (ONLY ONCE)
User.hasMany(Rating, { foreignKey: "userId" });
Rating.belongsTo(User, { foreignKey: "userId" });

Store.hasMany(Rating, { foreignKey: "storeId" });
Rating.belongsTo(Store, { foreignKey: "storeId" });

// ✅ Store Owner Relation
User.hasMany(Store, {
    foreignKey: "owner_id",
    onDelete: "CASCADE",
    hooks: true
});

Store.belongsTo(User, {
    foreignKey: "owner_id",
});

module.exports = {
    sequelize,
    User,
    Store,
    Rating
};