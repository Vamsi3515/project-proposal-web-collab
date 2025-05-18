const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController.js");
const multer = require('multer');
const upload = require("../middlewares/multerConfig");

//upload certificate
router.post('/upload-certificate', upload.single('certificate'), certificateController.uploadCertificate);

//fetch certificate by id
router.get('/view/:certificateId', certificateController.getCertificateById);

module.exports = router;