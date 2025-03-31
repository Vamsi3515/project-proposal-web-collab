const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/config/db.js");

// const userRoutes = require("./routes/userRoutes");
// const projectRoutes = require("./routes/projectRoutes");
// const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

db.getConnection()
    .then((connection) => {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });

// app.use("/api/users", userRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || "Internal server error!" });
});

app.get("/", (req, res) => {
    res.send("Welcome to the Project Request Platform!");
});

module.exports = app;