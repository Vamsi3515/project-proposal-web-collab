const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticateUser = require("../middlewares/authMiddleware");
const crypto = require("crypto");

router.get("/all", authenticateUser, paymentController.getUserDashboardPayments);
router.get("/pending", authenticateUser, paymentController.getPendingPayments);
router.get("/history", authenticateUser, paymentController.getPaymentHistory);

router.post('/create-payment-order', authenticateUser,paymentController.createPaymentOrder);

router.post('/capture-payment', authenticateUser,paymentController.capturePayment);

// router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//   const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//   const signature = req.headers['x-razorpay-signature'];
//   const body = req.body;
//   const expectedSignature = crypto
//     .createHmac('sha256', secret)
//     .update(JSON.stringify(body))
//     .digest('hex');

//   if (signature !== expectedSignature) {
//     return res.status(400).json({ message: "Invalid signature" });
//   }

//   const event = body.event;
//   const payload = body.payload;

//   switch (event) {
//     case 'payment.captured':
//       const paymentId = payload.payment.entity.id;
//       break;
//     case 'payment.failed':
//       break;
//   }

//   res.status(200).json({ received: true });
// });

module.exports = router;