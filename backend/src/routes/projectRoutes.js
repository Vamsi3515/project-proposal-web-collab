const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController.js");
const authenticateUser = require("../middleware/authMiddleware");
const authorizeAdminOrOwner = require("../middleware/authorizationMiddleware");
const { validateProjectData } = require("../middleware/inputValidationMiddleware");
const projectController = require("../controllers/projectController");

router.post("/request", authenticateUser, validateProjectData, projectController.createProject);
router.get("/all", authenticateUser, projectController.getAllProjects);
router.get("/:id", authenticateUser, projectController.getProjectById);
router.put("/:id", authenticateUser, authorizeAdminOrOwner, validateProjectData, projectController.updateProject);
router.delete("/:id", authenticateUser, authorizeAdminOrOwner, projectController.deleteProject);

module.exports = router;