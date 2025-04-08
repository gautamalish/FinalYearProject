// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const connectDB = require("./conn/db");
const User = require("./models/UserModel");
const { storage, cloudinary } = require("./utils/cloudinary");
const Category = require("./models/CategoryModel");
const multer = require("multer");
const upload = multer({ storage });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
connectDB();
// Admin Middleware (verify admin status)
const verifyAdmin = async (req, res, next) => {
  try {
    console.log("Authorization header:", req.headers.authorization); // Debug 1

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided"); // Debug 2
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded UID:", decodedToken.uid); // Debug 3

    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    console.log("Found user:", user); // Debug 4

    if (!user || user.role !== "admin") {
      console.log("User not admin:", user?.role); // Debug 5
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error); // Debug 6
    res.status(500).json({ error: error.message });
  }
};
// Routes
app.post("/api/users", async (req, res) => {
  try {
    console.log("Incoming request data:", req.body);

    if (!req.body.token) {
      throw new Error("Missing authentication token");
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(req.body.token);
    console.log("Decoded Firebase UID:", decodedToken.uid);

    const firebaseUID = decodedToken.uid;
    const existingUser = await User.findOne({ firebaseUID });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }
    const phone =
      req.body.phone && req.body.phone.trim() !== "" ? req.body.phone : "N/A";

    // Create new user
    const newUser = new User({
      firebaseUID,
      name: req.body.name,
      phone: phone,
      email: req.body.email,
      role: req.body.role || "client",
    });

    await newUser.save();
    console.log("User saved to MongoDB:", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/users/me", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add this before your admin routes
app.get("/api/users/me/info", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      // other non-sensitive fields
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ADMIN-ONLY ROUTES

// Job Categories CRUD Operations
app.get("/api/admin/categories", verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update your POST route in server.js
app.post(
  "/api/admin/categories",
  verifyAdmin,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      // Make thumbnail optional
      const thumbnail = req.file
        ? {
            url: req.file.path,
            publicId: req.file.filename,
          }
        : {
            url: "https://via.placeholder.com/150",
            publicId: "",
          };

      const category = new Category({
        name, // Changed from title to name to match frontend
        description,
        thumbnail,
        createdBy: req.user._id,
      });

      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (err) {
      console.error("Error uploading category:", err);
      res.status(400).json({
        message: err.message,
        error: err, //full error in development
      });
    }
  }
);

app.put(
  "/api/admin/categories/:id",
  verifyAdmin,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const updateData = { name, description };

      // Handle thumbnail update if file was uploaded
      if (req.file) {
        updateData.thumbnail = {
          url: req.file.path,
          publicId: req.file.filename,
        };

        // Optional: Delete old thumbnail from Cloudinary
        const oldCategory = await Category.findById(req.params.id);
        if (oldCategory?.thumbnail?.publicId) {
          await cloudinary.uploader.destroy(oldCategory.thumbnail.publicId);
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (err) {
      console.error("Error updating category:", err);
      res.status(400).json({
        error: "Failed to update category",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

app.delete("/api/admin/categories/:id", verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete thumbnail from Cloudinary if exists
    if (category.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(category.thumbnail.publicId);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory: category,
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({
      error: "Failed to delete category",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// User Management
app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete from Firebase first
    await admin.auth().deleteUser(user.firebaseUID);

    // Then delete from MongoDB
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Endpoints
app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    // Add more counts as needed

    res.json({
      totalUsers: userCount,
      totalCategories: categoryCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
