const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdmin = require("../middlewares/authorizeAdmin");
const adminController = require("../controllers/adminController");
const upload = require("../middlewares/multerConfig");

//admin login
router.post('/login', adminController.loginAdmin);

//authenticate admin
router.use(authenticateUser, authorizeAdmin);

//fetch projects
router.get("/projects",authorizeAdmin, adminController.getAllProjects);

//update project
router.patch("/projects/:id/status", adminController.updateProjectStatus);

//set project price
router.patch("/projects/:id/price", adminController.setProjectPrice);

//fetch all reports
router.get("/reports", authorizeAdmin, adminController.getAllReports);

//fetch all payments
router.get("/payments", authorizeAdmin, adminController.getAllPayments);

//approve project
router.post('/projects/approve/:projectId', authorizeAdmin, adminController.approveProject);

//reject project
router.post("/projects/reject/:projectId", authorizeAdmin, adminController.rejectProject);

//close report
router.post('/reports/close/:reportId', authorizeAdmin, adminController.closeReport);

//delete report
router.delete('/reports/:reportId', authorizeAdmin, adminController.deleteReport);

//delete project including user date
router.delete('/projects/delete/:projectId', authorizeAdmin, adminController.deleteProject);

//add new domain
router.post("/domains", upload.single("pdf"), adminController.addDomain);

//fetch all domains
router.get("/domains", authorizeAdmin, adminController.getAllDomains);

//update existing domain
router.post("/domains/update/:id", upload.single("pdf"), adminController.updateDomain);

//delete domain
router.post("/domains/delete/:id", authorizeAdmin, adminController.deleteDomain);

//upload project solution
router.post("/upload-solution", upload.array("files"), adminController.uploadProjectSolution);

//add project note
router.post('/add-note', authorizeAdmin, adminController.addProjectNote);

//update project details
router.put('/update-project/:projectCode', authorizeAdmin, adminController.updateProjectDetails);

//update report note
router.post( "/reports/:reportId/note", authorizeAdmin, adminController.updateReportNote);

//fetch project invoices
router.get('/project/:projectId/invoices', authorizeAdmin, adminController.getProjectInvoices);

//fetch payments by project id
router.get('/payments/:projectId', authorizeAdmin, adminController.getPaymentsByProjectId);

//refund payment
router.post("/payments/refund/:paymentId", authorizeAdmin, adminController.refundPayment);

module.exports = router;