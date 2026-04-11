const express = require("express");
const multer = require("multer");
const { processPDF } = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), processPDF);

module.exports = router;
