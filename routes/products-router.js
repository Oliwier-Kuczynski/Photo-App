const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), productsController.uploadPost);
router.post("/edit", upload.single("image"), productsController.editPost);

module.exports = router;
