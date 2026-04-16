const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

require('dns').setDefaultResultOrder('ipv4first');
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const { sequelize } = require("./models");


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);


app.get("/", (req, res) => {
    res.send("API Running...");
});

sequelize.authenticate()
    .then(() => {
        console.log("Database connected");

        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("DB Synced");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Error:", err);
    });
