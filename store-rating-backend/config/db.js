const { Sequelize } = require("sequelize");
require("dotenv").config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  host: "db.lnerfnidciawvuvwdqwq.supabase.co"
});
module.exports = sequelize;
