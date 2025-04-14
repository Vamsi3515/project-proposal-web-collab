const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const projectController = require("../controllers/projectController.js");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner.js");
const { validateProjectData } = require("../middlewares/inputValidationMiddleware.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/projects/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

router.post(
  "/request",
  authenticateUser,
  upload.single("referenceFile"),
  validateProjectData,
  projectController.createProject
);

router.get("/user", authenticateUser, projectController.getProjectsByUser);
router.get("/all", authenticateUser, projectController.getAllProjects);
router.get("/generate-id", authenticateUser, projectController.getProjectId);
router.get("projects/:id", authenticateUser, projectController.getProjectById);
router.patch("/change-domain/:id", authenticateUser, projectController.updateDomain);

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