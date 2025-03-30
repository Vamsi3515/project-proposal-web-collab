const mysql = require("mysql2");
const express = require("express");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started and listening at http://localhost/:${PORT}`);
});