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
const corsOptions = {
  origin: "http://localhost:5173", // Explicitly set your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));
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
  // Skip for OPTIONS requests
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing or malformed auth header");
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1].trim();
    console.log("Received token:", token); // Debug log

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token UID:", decodedToken.uid);

    // Check if user exists and is admin
    const user = await User.findOne({
      firebaseUID: decodedToken.uid,
      role: "admin",
    }).lean();

    if (!user) {
      console.log("User not found or not admin");
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Token expired - please refresh" });
    }

    res.status(401).json({
      error: "Authentication failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
app.get("/api/users/me/info", cors(corsOptions), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUID: decodedToken.uid });

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
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
      // Important: Use req.body for text fields, req.file for the image
      const { name, description } = req.body;

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
        name,
        description,
        thumbnail,
        createdBy: req.user._id,
      });

      const newCategory = await category.save();

      // Ensure consistent response format
      res.status(201).json({
        ...newCategory.toObject(),
        thumbnail: thumbnail.url, // Always return the URL string
      });
    } catch (err) {
      console.error("Create category error:", err);
      res.status(400).json({
        error: "Failed to create category",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
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
      const updateData = {
        name: req.body.name,
        description: req.body.description,
      };

      // Only process thumbnail if file was uploaded
      if (req.file) {
        // Delete old thumbnail if exists
        const oldCategory = await Category.findById(req.params.id);
        if (oldCategory?.thumbnail?.publicId) {
          await cloudinary.uploader
            .destroy(oldCategory.thumbnail.publicId)
            .catch((err) => console.error("Error deleting old image:", err));
        }

        updateData.thumbnail = {
          url: req.file.path,
          publicId: req.file.filename,
        };
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Ensure consistent response format
      res.json({
        ...updatedCategory.toObject(),
        thumbnail: updateData.thumbnail || updatedCategory.thumbnail,
      });
    } catch (err) {
      console.error("Update error:", err);
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
app.post("/api/categories/:id/view", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await category.incrementViewCount();
    res.json({ success: true, viewCount: category.viewCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get popular categories (most viewed)
app.get("/api/popular-categories", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const timePeriod = req.query.period || "all"; // 'all', 'week', 'month'

    let dateFilter = {};
    if (timePeriod === "week") {
      dateFilter = {
        lastViewed: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };
    } else if (timePeriod === "month") {
      dateFilter = {
        lastViewed: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };
    }

    const popularCategories = await Category.find(dateFilter)
      .sort({ viewCount: -1 })
      .limit(limit);

    res.json(popularCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Endpoints
// Analytics Endpoints
app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalWorkers = await User.countDocuments({ role: "worker" });

    // Growth calculations (you'll need to implement these properly)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const userGrowthPercentage =
      Math.round(
        (newUsersThisMonth / (totalUsers - newUsersThisMonth)) * 100
      ) || 0;

    const newCategoriesThisMonth = await Category.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    const newWorkersThisMonth = await User.countDocuments({
      role: "worker",
      createdAt: { $gte: oneMonthAgo },
    });

    // Recent activities (simplified example)
    const recentActivities = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt")
      .lean()
      .then((users) =>
        users.map((user) => ({
          type: "user",
          message: `New ${user.role} registered: ${user.name}`,
          timestamp: user.createdAt,
        }))
      );

    res.json({
      totalUsers,
      totalCategories,
      totalWorkers,
      userGrowthPercentage,
      newCategoriesThisMonth,
      newWorkersThisMonth,
      recentActivities,
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
