const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateUser = require("../middlewares/authMiddleware");

//upload invoice
router.post("/upload", authenticateUser, invoiceController.uploadInvoice);

//fetch invoice by id
router.get("/:id", authenticateUser, invoiceController.getInvoiceById);

//fetch all invoices
router.get("/all", authenticateUser, invoiceController.getAllInvoices);

module.exports = router;