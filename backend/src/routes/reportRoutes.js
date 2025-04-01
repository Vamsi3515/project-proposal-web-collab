const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController.js");
const authenticateUser = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

router.post("/create", authenticateUser, reportController.createReport);
router.get("/all", authenticateUser, reportController.getAllReports);
router.get("/:id", authenticateUser, reportController.getReportById);
router.put("/:id", authenticateUser, authorizeAdminOrOwner, reportController.updateReport);
router.delete("/:id", authenticateUser, authorizeAdminOrOwner, reportController.deleteReport);

module.exports = router;