const multer = require("multer");
const path = require("path");
const fs = require("fs");

//multer configuration for storing files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer Hit");

    const fullUrl = `${req.baseUrl}${req.url}`;
    console.log("baseUrl:", req.baseUrl);
    console.log("url:", req.url);
    console.log("fullUrl:", fullUrl);

    let dir = "uploads/projects";

    console.log("Hit multer");

    if (req.url.includes("/domains")) {
      dir = "uploads/domains";
    } else if (req.url.includes("/upload-solution")) {
      dir = "uploads/projects/solutions";
    } else if (fullUrl.includes("/reports")) {
      dir = "uploads/reports";
    } else if (req.originalUrl.includes("/certificates")) {
      dir = "uploads/certificates/view";
    }

    fs.mkdirSync(dir, { recursive: true }); 
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, PNG, ZIP, and RAR files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;