const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const pdfRoutes = require("./routes/pdfRoutes");
const imageRoutes = require("./routes/imageRoutes");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Enabling CORS
app.use(cors());

// Import routes
app.use("/pdf", pdfRoutes);
app.use("/image", imageRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve the frontend application
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
