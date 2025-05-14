const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController.js");
const multer = require('multer');
const upload = require("../middlewares/multerConfig");

router.post('/upload-certificate', upload.single('certificate'), certificateController.uploadCertificate);
router.get('/view/:certificateId', certificateController.getCertificateById);

module.exports = router;