// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const connectDB = require("./conn/db");
const User = require("./models/UserModel");

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
