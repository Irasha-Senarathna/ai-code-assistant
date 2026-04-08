const express = require("express");
const router = express.Router();
const { generateResponse } = require("../controllers/generateController");

router.post("/", generateResponse);

module.exports = router;