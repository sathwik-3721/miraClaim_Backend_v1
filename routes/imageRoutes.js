const express = require("express");
const { verifyMetadata, analyzeImage } = require("../controllers/imageController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/verify-metadata", upload.array("images", 10), verifyMetadata);
router.get("/analyze-image", analyzeImage);

module.exports = router;
