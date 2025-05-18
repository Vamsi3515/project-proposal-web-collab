const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner");
const upload = require("../middlewares/multerConfig");

//fetch all reports
router.get("/all", authorizeAdminOrOwner, reportController.getAllReports);

//fetch user reports
router.get("/user", authMiddleware, reportController.getUserReports);

//create new report
router.post("/create", authMiddleware, upload.single("pdf"), reportController.createReport);

//update report status
router.put("/update-status/:reportId", authorizeAdminOrOwner, reportController.updateReportStatus);

//check whether user has reports
router.get("/check", authMiddleware,reportController.checkUserReports);

module.exports = router;