const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 9527; // Changed to match your request

// Create uploads directory if it doesn't exist
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only!");
    }
  },
  limits: { fileSize: 1000000 }, // 1MB limit
});

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header("access-control-allow-origin", "*");
  next();
});

// Single file upload endpoint
app.post("/upload/single", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      errCode: 1,
      errMsg: "File upload failed",
    });
  }

  // Return the relative path to the uploaded file
  const filePath = `/uploads/${req.file.filename}`;
  res.json({
    data: filePath,
  });
});

// Error handling for unsupported file types or size
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).json({
      errCode: 2,
      errMsg: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
