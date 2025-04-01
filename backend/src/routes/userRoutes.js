const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
// router.post("/verify-otp", userController.verifyOTP);

module.exports = router;