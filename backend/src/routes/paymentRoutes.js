const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController.js");
const authenticateUser = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/create", authenticateUser, paymentController.createPayment);
router.get("/pending/:userId", authenticateUser, paymentController.getPendingPayments);
router.get("/history/:userId", authenticateUser, paymentController.getPaymentHistory);
router.post("/confirm", authenticateUser, paymentController.confirmPayment);

module.exports = router;