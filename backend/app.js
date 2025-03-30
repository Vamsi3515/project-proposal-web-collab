const mysql = require("mysql2");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({message : err.message || "Internal server error!"});
});

app.get("/", (req, res) => {
    res.send("Welcome to the Project Request Platform!");
});

module.exports = app;