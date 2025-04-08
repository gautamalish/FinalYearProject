require("dotenv").config();
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const connectDB = require("../conn/db");
const User = require("../models/UserModel"); // Verify this path is correct
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const createAdmin = async () => {
  let mongoClient;
  try {
    // 1. Connect to MongoDB
    mongoClient = await connectDB();
    console.log("Connected to DB:", mongoose.connection.db.databaseName);

    const email = "newadmin@example.com";
    const password = "securePassword123";
    const name = "System Admin";

    // 2. Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
    });

    // 3. Verify User model
    if (!mongoose.models.User) {
      throw new Error("User model not registered");
    }

    // 4. Create MongoDB document
    const adminUser = await User.create({
      firebaseUID: userRecord.uid,
      name,
      email,
      role: "admin",
    });

    console.log("✅ Success! Created in both Firebase and MongoDB");
    console.log("MongoDB Document ID:", adminUser._id);
  } catch (error) {
    console.error("❌ Full error:", error);
    if (error.errorInfo) {
      console.log("Firebase error:", error.errorInfo.code);
    }
  } finally {
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit();
  }
};

createAdmin();
