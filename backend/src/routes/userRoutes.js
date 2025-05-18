const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { validateOTP } = require("../middlewares/validateOTP.js");
const authenticateUser = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/multerConfig");

//verify OTP and Register
router.post("/register",validateOTP, userController.verifyOtpAndRegister);

//user login
router.post("/login", userController.loginUser);

//verify otp
router.post("/verify-otp", validateOTP ,userController.verifyOTP);

//send otp to email
router.post("/send-otp", userController.sendOtpToEmail);

//submit user multistep form
router.post("/submit-multistep-data", authenticateUser, userController.submitMultistepData);

//fetch all project domains
router.get("/domains", userController.getAllDomains);

module.exports = router;