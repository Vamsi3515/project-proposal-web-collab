const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController.js");
const authenticateUser = require("../middleware/authMiddleware");
const invoiceController = require("../controllers/invoiceController");

router.post("/upload", authenticateUser, invoiceController.uploadInvoice);
router.get("/:id", authenticateUser, invoiceController.getInvoiceById);
router.get("/all", authenticateUser, invoiceController.getAllInvoices);

module.exports = router;