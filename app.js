const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const pdfRoutes = require("./routes/pdfRoutes");
const imageRoutes = require("./routes/imageRoutes");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/pdf", pdfRoutes);
app.use("/image", imageRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
