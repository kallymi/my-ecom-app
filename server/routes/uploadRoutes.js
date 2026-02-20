const express = require("express");
const router = express.Router();

const { uploadCloudinary } = require("../middleware/uploadMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

router.post(
  "/upload-images",
  protect,
  admin,
  uploadCloudinary.array("images", 10), // ✅ MAX 10 images
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucune image envoyée" });
    }

    const images = req.files.map((file, index) => ({
      url: file.path,          // ✅ URL Cloudinary
      public_id: file.filename, // ✅ nécessaire pour delete/update
      isMain: index === 0       // ✅ première image = principale
    }));

    res.status(201).json({
      success: true,
      images
    });
  }
);

module.exports = router;
