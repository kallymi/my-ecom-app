const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

/* =====================================================
   FILTRE DES FICHIERS (sécurité)
===================================================== */
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format d’image non supporté (JPG, PNG, WEBP uniquement)"
      ),
      false
    );
  }
};

/* =====================================================
   CLOUDINARY STORAGE
===================================================== */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ecommerce/products",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto"
        }
      ]
    };
  }
});

/* =====================================================
   MULTER CONFIG
===================================================== */
const uploadCloudinary = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/* =====================================================
   EXPORT
===================================================== */
module.exports = { uploadCloudinary };
