const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/config/db.js");
const path = require('path');
const fs = require("fs");

const userRoutes = require("./src/routes/userRoutes.js");
const projectRoutes = require("./src/routes/projectRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");
const invoiceRoutes = require("./src/routes/invoiceRoutes.js");
const reportRoutes = require("./src/routes/reportRoutes.js");
const adminRoutes = require("./src/routes/adminRoutes.js");
const certificateRoutes = require("./src/routes/certificateRoutes.js");

const helmet = require("helmet");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

db.getConnection()
    .then((connection) => {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });

app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || "Internal server error!" });
});
app.get("/", (req, res) => {
    res.send("Welcome to the Hugo Technologies!");
});
app.get('/download/*', (req, res) => {
    const relativePath = req.params[0];
    console.log("relative path :", relativePath);
    const filePath = path.join(__dirname, relativePath);
    console.log("Download path:", filePath);
  
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });
  

module.exports = app;