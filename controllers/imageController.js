const { extractExifData, analyzeImageContent } = require("../services/imageService");
const { getClaimDetails } = require("./pdfController");

let imageBuffer;
exports.verifyMetadata = async (req, res) => {
  try {
    const { claimDate } = getClaimDetails();
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const { formattedDate, validationMessage } = extractExifData(req.files[0].buffer, claimDate);
    imageBuffer=req.files[0].buffer
    return res.status(200).json({ message: validationMessage, claimDate, imageDate: formattedDate });
  } catch (error) {
    console.error("Error reading EXIF data:", error.message);
    return res.status(500).send("Error reading EXIF data.");
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    const { itemCovered } = getClaimDetails();
    const result = await analyzeImageContent(imageBuffer, itemCovered);
    return res.json(result);
  } catch (error) {
    console.error("Error processing image:", error.message);
    return res.status(500).send("Error processing image.");
  }
};
