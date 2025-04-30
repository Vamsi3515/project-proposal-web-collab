const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdmin = require("../middlewares/authorizeAdmin");
const adminController = require("../controllers/adminController");

router.post('/login', adminController.loginAdmin);

router.use(authenticateUser, authorizeAdmin);

router.get("/projects",authorizeAdmin, adminController.getAllProjects);
router.patch("/projects/:id/status", adminController.updateProjectStatus);
router.patch("/projects/:id/price", adminController.setProjectPrice);
router.get("/reports", authorizeAdmin, adminController.getAllReports);
router.get("/payments", authorizeAdmin, adminController.getAllPayments);

module.exports = router;