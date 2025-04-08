const { cloudinary } = require("../utils/cloudinary");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // The file is already uploaded to Cloudinary by Multer
    // We just need to return the URL
    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: error.message || "Failed to upload image",
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete image" });
  }
};
