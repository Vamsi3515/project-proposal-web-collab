const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController.js");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner.js");
const { validateProjectData } = require("../middlewares/inputValidationMiddleware.js");
const upload = require("../middlewares/multerConfig.js");

//submit new project
router.post(
  "/request",
  authenticateUser,
  upload.single("referenceFile"),
  validateProjectData,
  projectController.createProject
);

//fetch user projects
router.get("/user", authenticateUser, projectController.getProjectsByUser);

//fetch all projects
router.get("/all", authenticateUser, projectController.getAllProjects);

//fetch project id
router.get("/generate-id", authenticateUser, projectController.getProjectId);

//fetch projects by id
router.get("projects/:id", authenticateUser, projectController.getProjectById);

//update project domain
router.patch("/change-domain/:id", authenticateUser, projectController.updateDomain);

//update project status
router.put('/projects/:id/status', authenticateUser, authorizeAdminOrOwner, projectController.updateProjectStatus);

//generate invoice
router.post('/generate-invoice', authenticateUser, authorizeAdminOrOwner, projectController.generateInvoice);

//create new project
router.post('/projects', upload.single('projectFile'), projectController.createProject);

router.put(
  "/:id",
  authenticateUser,
  authorizeAdminOrOwner,
  validateProjectData,
  projectController.updateProject
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeAdminOrOwner,
  projectController.deleteProject
);


module.exports = router;