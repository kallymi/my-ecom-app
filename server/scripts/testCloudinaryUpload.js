require("dotenv").config();
const cloudinary = require("../utils/cloudinary");

(async () => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "ecommerce/test",
        transformation: [
          { width: 800, height: 800, crop: "limit", quality: "auto" }
        ]
      }
    );

    console.log("UPLOAD OK");
    console.log({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error("UPLOAD ERROR");
    console.error(error);
  }
})();
