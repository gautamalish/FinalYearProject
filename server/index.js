// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const connectDB = require("./conn/db");
const User = require("./models/UserModel");
const Job = require("./models/JobModel");
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

// Jobs CRUD Operations
app.post("/api/admin/jobs", verifyAdmin, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      createdBy: req.user._id,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/admin/jobs", verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/jobs/:id", verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/jobs/:id", verifyAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const workerCount = await User.countDocuments({ role: "worker" });
    const jobCount = await Job.countDocuments();
    const activeJobCount = await Job.countDocuments({ status: "active" });

    res.json({
      userCount,
      workerCount,
      jobCount,
      activeJobCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
