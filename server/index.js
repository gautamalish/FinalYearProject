// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const mongoose = require("mongoose");
const connectDB = require("./conn/db");
const User = require("./models/UserModel");
const Client = require("./models/ClientModel");
const Worker = require("./models/WorkerModel");
const Review = require("./models/ReviewModel");
const { storage, cloudinary } = require("./utils/cloudinary");
const Category = require("./models/CategoryModel");
const multer = require("multer");
const upload = multer({ storage });
const app = express();

// Middleware
const corsOptions = {
  origin: "http://localhost:5173", // Explicitly set your frontend origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

// Import routes
const notificationRoutes = require("./routes/notificationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Mount routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

// Define verifyUser middleware
const verifyUser = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1].trim();
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Important: Use exec() for better error handling
    const user = await User.findOne({ firebaseUID: decodedToken.uid })
      .select("firebaseUID role")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({
        error: "User not found in database",
        action: "register",
      });
    }

    req.user = {
      firebaseUID: user.firebaseUID,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ error: "Token expired", action: "refresh" });
    }

    res.status(401).json({
      error: "Authentication failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
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

    // Set the user data in the request
    req.user = {
      ...user,
      _id: user._id.toString(), // Ensure _id is a string
    };

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
// Update user role (for both users and admins)
// Profile update endpoint
app.put(
  "/api/users/profile",
  verifyUser,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { firebaseUID } = req.user;
      const { name, email, phone, hourlyRate } = req.body;

      console.log("Profile update request:", { name, email, phone, hourlyRate });

      // Prepare update data
      const updateData = { name, email, phone };

      // Handle profile image if uploaded
      if (req.file) {
        updateData.profilePicture = req.file.path;
      }

      // Start a MongoDB session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update user in database
        const updatedUser = await User.findOneAndUpdate(
          { firebaseUID },
          updateData,
          { new: true, session }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        let workerData = null;
        
        // If user is a worker and hourlyRate is provided, update the Worker document
        if (updatedUser.role === "worker" && hourlyRate !== undefined) {
          // Ensure hourlyRate is a valid positive number
          const parsedHourlyRate = parseFloat(hourlyRate);
          if (isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
            throw new Error("Hourly rate must be a valid positive number");
          }

          // Update hourly rate in Worker collection
          workerData = await Worker.findOneAndUpdate(
            { firebaseUID },
            { hourlyRate: parsedHourlyRate },
            { new: true, session }
          );

          if (!workerData) {
            throw new Error("Worker data not found");
          }

          // Also update hourlyRate in User collection to keep them in sync
          await User.findOneAndUpdate(
            { firebaseUID },
            { hourlyRate: parsedHourlyRate },
            { session }
          );

          console.log("Updated worker hourly rate in both collections:", parsedHourlyRate);
        }

        await session.commitTransaction();

        // Combine user and worker data for response
        const responseData = {
          ...updatedUser.toObject(),
          hourlyRate: workerData?.hourlyRate
        };

        res.status(200).json(responseData);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(400).json({ error: error.message || "Failed to update profile" });
    }
  }
);

app.patch("/api/users/:firebaseId/role", verifyUser, async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { role } = req.body;
    const { firebaseId } = req.params;

    // Validate role
    if (!["client", "worker"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Find user by firebaseId
    const user = await User.findOne({ firebaseUID: firebaseId }).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the role is actually changing
    if (user.role === role) {
      return res.status(400).json({ error: "User already has this role" });
    }

    // Update user role
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: firebaseId },
      { role },
      { new: true, session }
    );

    // If changing to worker, ensure they exist in workers collection
    if (role === "worker") {
      await Worker.findOneAndUpdate(
        { firebaseUID: firebaseId },
        {
          $setOnInsert: {
            firebaseUID: firebaseId,
            name: user.name,
            email: user.email,
          },
        },
        { upsert: true, session }
      );
    } else if (user.role === "worker") {
      // If changing from worker to client, remove from workers collection
      await Worker.deleteOne({ firebaseUID: firebaseId }, { session });
    }

    // Handle role change from client to worker
    if (role === "worker") {
      // Check if user exists in Client collection
      const clientData = await Client.findOne({
        firebaseUID: firebaseId,
      }).lean();

      // Create worker document with data from user and client
      const workerData = {
        firebaseUID: user.firebaseUID,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        categories: req.body.categories || [],
        profileImage: req.body.profilePicture || "",
        // Add location fields
        nationality: req.body.nationality || "",
        residence: req.body.residence || "",
        // Add experience field
        experience: req.body.experience || "",
        rating: 0,
        completedJobs: 0,
        // Add other worker-specific fields with defaults
        title: req.body.title || "",
        bio: req.body.bio || "",
        availability: {
          days: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          },
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
      };

      // Create new worker document
      const newWorker = new Worker(workerData);
      await newWorker.save({ session });

      // Delete client document if it exists
      if (clientData) {
        await Client.findOneAndDelete({ firebaseUID: firebaseId }, { session });
      }

      // Update user document with new role and worker-specific fields
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUID: firebaseId },
        {
          role,
          categories: req.body.categories || [],
          profilePicture: req.body.profilePicture || "",
        },
        { new: true, session }
      );

      await session.commitTransaction();
      res.json(updatedUser);
    }
    // Handle role change from worker to client
    else if (role === "client") {
      // Check if user exists in Worker collection
      const workerData = await Worker.findOne({
        firebaseUID: firebaseId,
      }).lean();

      // Create client document with data from user and worker
      const clientData = {
        firebaseUID: user.firebaseUID,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        jobsRequested: 0,
      };

      // Create new client document
      const newClient = new Client(clientData);
      await newClient.save({ session });

      // Delete worker document if it exists
      if (workerData) {
        await Worker.findOneAndDelete({ firebaseUID: firebaseId }, { session });
      }

      // Update user document with new role and remove worker-specific fields
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUID: firebaseId },
        {
          role,
          $unset: { categories: "", profilePicture: "" },
        },
        { new: true, session }
      );

      await session.commitTransaction();
      res.json(updatedUser);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  } finally {
    session.endSession();
  }
});

// Get current user info
app.get("/api/users/me", verifyUser, async (req, res) => {
  try {
    if (!req.user?.firebaseUID) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findOne(
      { firebaseUID: req.user.firebaseUID },
      { password: 0, __v: 0 }
    ).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        action: "register",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Client and Worker models already imported at the top of the file

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
    const name = req.body.name || decodedToken.name || "";
    const email = req.body.email || decodedToken.email || "";
    const role = req.body.role === "worker" ? "worker" : "client";

    // Create base user document
    const newUser = new User({
      firebaseUID,
      name,
      phone,
      email,
      role,
    });

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save the base user document
      await newUser.save({ session });

      // Add worker-specific fields if role is worker
      if (role === "worker") {
        newUser.categories = req.body.categories || [];
        newUser.profilePicture = req.body.profilePicture || "";
        newUser.rating = 0;

        // Create worker document
        const newWorker = new Worker({
          firebaseUID,
          name,
          phone,
          email,
          categories: req.body.categories || [],
          profilePicture: req.body.profilePicture || "",
          rating: 0,
          jobsCompleted: 0,
        });
        await newWorker.save({ session });
      } else {
        // Create client document
        const newClient = new Client({
          firebaseUID,
          name,
          phone,
          email,
          jobsRequested: 0,
        });
        await newClient.save({ session });
      }

      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // If there's an error, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
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
app.get("/api/users/me", verifyUser, async (req, res) => {
  try {
    if (!req.user?.firebaseUID) {
      console.log("No firebaseUID in request");
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("Fetching user with firebaseUID:", req.user.firebaseUID);
    const user = await User.findOne(
      { firebaseUID: req.user.firebaseUID },
      { _id: 1, name: 1, email: 1, role: 1, firebaseUID: 1 }
    ).lean();

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        success: false,
        error: "User not found",
        action: "register",
      });
    }

    console.log("User found:", {
      role: user.role,
      firebaseUID: user.firebaseUID,
    });
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUID: user.firebaseUID,
      },
    });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
// Add this before your admin routes
// Get user by Firebase UID
app.get("/api/users/firebase/:firebaseUID", verifyUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by Firebase UID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

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
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().select("-createdBy -__v");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
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
// Worker Registration Endpoint
app.post(
  "/api/workers/register",
  verifyUser,
  upload.single("profileImage"),
  async (req, res) => {
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate required fields
      const { phone, nationality, residence, category, hourlyRate, experience } = req.body;
      if (!phone || !nationality || !residence || !category || !hourlyRate || !experience) {
        return res
          .status(400)
          .json({ message: "Please fill in all required fields" });
      }

      const firebaseUID = req.user.firebaseUID;

      // Ensure hourlyRate is a valid positive number
      const parsedHourlyRate = parseFloat(hourlyRate);
      if (isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
        return res.status(400).json({ message: "Hourly rate must be a valid positive number" });
      }

      // Find user by firebaseUID
      const user = await User.findOne({ firebaseUID });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already a worker
      if (user.role === "worker") {
        return res
          .status(400)
          .json({ message: "User is already registered as a worker" });
      }

      // Check if user exists in Client collection
      const clientData = await Client.findOne({ firebaseUID }).lean();

      // Create worker document with data from user and form
      // Create worker document with data from user and form
      const workerData = {
        firebaseUID: user.firebaseUID,
        name: user.name,
        email: user.email,
        phone,
        nationality,
        residence,
        experience,
        categories: [category], // Store as array since schema expects array
        hourlyRate: parsedHourlyRate,
        profileImage: req.file ? req.file.path : "",
        rating: 0,
        completedJobs: 0,
        availability: {
          days: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          },
          hours: {
            start: "09:00",
            end: "17:00"
          }
        }
      };

      // Create new worker document
      const newWorker = new Worker(workerData);
      await newWorker.save({ session });

      // Update user role to worker and save hourly rate
      await User.findOneAndUpdate(
        { firebaseUID },
        { role: "worker", hourlyRate: parsedHourlyRate },
        { session }
      );

      // Delete client document if it exists
      if (clientData) {
        await Client.findOneAndDelete({ firebaseUID }, { session });
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Successfully registered as worker",
        worker: newWorker
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error registering worker:", error);
      res.status(500).json({ message: "Failed to register as worker" });
    } finally {
      session.endSession();
    }
  }
);

// Get all workers
app.get("/api/workers", async (req, res) => {
  try {
    const workers = await Worker.find({ role: "worker" })
      .select(
        "name email phone profilePicture rating categories firebaseUID createdAt hourlyRate experience nationality residence"
      )
      .populate("categories", "name description thumbnail")
      .lean();

    // Get all reviews for these workers
    const workerIds = workers.map((worker) => worker._id);
    const reviews = await Review.find({ worker: { $in: workerIds } })
      .populate("client", "name")
      .lean();

    // Group reviews by worker
    const reviewsByWorker = reviews.reduce((acc, review) => {
      if (!acc[review.worker]) {
        acc[review.worker] = [];
      }
      acc[review.worker].push(review);
      return acc;
    }, {});

    // Transform the workers data to include review statistics
    const workersWithReviews = workers.map((worker) => {
      const workerReviews = reviewsByWorker[worker._id] || [];
      const totalRatings = workerReviews.length;
      const averageRating =
        totalRatings > 0
          ? workerReviews.reduce((sum, review) => sum + review.rating, 0) /
            totalRatings
          : 0;

      return {
        ...worker,
        rating: averageRating,
        reviewCount: totalRatings,
        reviews: workerReviews.map((review) => ({
          rating: review.rating,
          comment: review.comment,
          clientName: review.client?.name || "Anonymous",
          date: new Date(review.createdAt).toLocaleDateString(),
        })),
      };
    });

    console.log("Found workers:", workersWithReviews); // Debug log
    res.json(workersWithReviews);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

// Get workers by category
app.get("/api/workers/category/:categoryId", async (req, res) => {
  try {
    const workers = await Worker.find({
      categories: req.params.categoryId,
    })
      .select("name email phone profileImage rating availability")
      .lean();

    // Ensure we always return an array
    res.json(Array.isArray(workers) ? workers : []);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json([]); // Return empty array on error
  }
});

// Get worker by Firebase UID
app.get("/api/workers/:firebaseUID", async (req, res) => {
  try {
    // Find worker by firebaseUID
    const worker = await Worker.findOne({ firebaseUID: req.params.firebaseUID })
      .populate("categories", "name description")
      .select("+experience +nationality +residence")
      .lean();

    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.json(worker);
  } catch (error) {
    console.error("Error fetching worker by Firebase UID:", error);
    res.status(500).json({ error: "Failed to fetch worker details" });
  }
});

// Get worker details by ID
app.get("/api/workers/details/:workerId", async (req, res) => {
  try {
    // First try to find worker by MongoDB _id
    let worker = await Worker.findById(req.params.workerId)
      .populate("categories", "name description")
      .lean()
      .catch(() => null); // Catch invalid ObjectId errors

    // If not found by _id, try to find by firebaseUID
    if (!worker) {
      worker = await Worker.findOne({ firebaseUID: req.params.workerId })
        .populate("categories", "name description")
        .lean();
    }

    // If still not found, try User model (some workers might only exist in User model)
    if (!worker) {
      worker = await User.findOne({
        $or: [
          { _id: req.params.workerId },
          { firebaseUID: req.params.workerId },
        ],
        role: "worker",
      })
        .select("name email phone profilePicture rating categories firebaseUID")
        .populate("categories", "name description")
        .lean();
    }

    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.json(worker);
  } catch (error) {
    console.error("Error fetching worker details:", error);
    res.status(500).json({ error: "Failed to fetch worker details" });
  }
});

app.put(
  "/api/admin/categories/:id",
  verifyAdmin,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const categoryId = req.params.id;

      // Find the existing category
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Prepare update data
      const updateData = { name, description };

      // Handle thumbnail upload if a new file is provided
      if (req.file) {
        // Delete old thumbnail from Cloudinary if it exists
        if (category.thumbnail?.publicId) {
          await cloudinary.uploader.destroy(category.thumbnail.publicId);
        }

        // Add new thumbnail data
        updateData.thumbnail = {
          url: req.file.path,
          publicId: req.file.filename,
        };
      }

      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true }
      );

      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        error: "Failed to update category",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
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
app.post("/api/categories/:id/view", verifyUser, async (req, res) => {
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
    const timePeriod = req.query.period || "all";

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
      .limit(limit)
      .select("-createdBy -__v");

    res.json(popularCategories);
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    res.status(500).json({ error: "Failed to fetch popular categories" });
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

    // Get user by Firebase UID
    app.get("/api/users/:firebaseUID", verifyUser, async (req, res) => {
      try {
        const user = await User.findOne({
          firebaseUID: req.params.firebaseUID,
        });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Update user categories
    app.patch(
      "/api/users/:firebaseUID/categories",
      verifyUser,
      async (req, res) => {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { firebaseUID: req.params.firebaseUID },
            { $set: { categories: req.body.categories } },
            { new: true }
          );
          res.json(updatedUser);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    );
    // User Profile Image Routes
    app.patch(
      "/api/admin/users/:userId/profile-image",
      verifyAdmin,
      async (req, res) => {
        try {
          const { profileImage } = req.body;

          const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { profileImage },
            { new: true }
          );

          res.json(updatedUser);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    );
    // Update worker availability
    app.patch(
      "/api/workers/:firebaseUID/availability",
      verifyUser,
      async (req, res) => {
        try {
          const updatedWorker = await Worker.findOneAndUpdate(
            { firebaseUID: req.params.firebaseUID },
            { $set: { availability: req.body } },
            { new: true }
          );

          res.json(updatedWorker);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    );
    // Get worker statistics
    app.get("/api/workers/:workerId/stats", verifyUser, async (req, res) => {
      try {
        const { range } = req.query;
        const workerId = req.params.workerId;

        // Calculate date ranges based on the selected time range
        let startDate;
        const endDate = new Date();

        switch (range) {
          case "7days":
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "30days":
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            break;
          case "90days":
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 90);
            break;
          case "12months":
            startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          default: // 'all'
            startDate = new Date(0); // Unix epoch
        }

        // Get worker data
        const worker = await Worker.findById(workerId).lean();

        // Get job statistics
        const jobsCompleted = await Job.countDocuments({
          worker: workerId,
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        });

        const jobsInProgress = await Job.countDocuments({
          worker: workerId,
          status: { $in: ["in_progress", "accepted"] },
        });

        // Get rating statistics
        const ratingAggregation = await Review.aggregate([
          { $match: { worker: mongoose.Types.ObjectId(workerId) } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              totalRatings: { $sum: 1 },
              ratingDistribution: {
                $push: {
                  k: { $toString: "$rating" },
                  v: 1,
                },
              },
            },
          },
          {
            $project: {
              averageRating: 1,
              totalRatings: 1,
              ratingDistribution: { $arrayToObject: "$ratingDistribution" },
            },
          },
        ]);

        // Get earnings statistics
        const earningsAggregation = await Job.aggregate([
          {
            $match: {
              worker: mongoose.Types.ObjectId(workerId),
              status: "completed",
              completedAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalEarnings: { $sum: "$price" },
              totalFees: { $sum: "$serviceFee" },
              avgEarningsPerJob: { $avg: "$price" },
            },
          },
        ]);

        // Get pending earnings
        const pendingEarningsAggregation = await Job.aggregate([
          {
            $match: {
              worker: mongoose.Types.ObjectId(workerId),
              status: "completed",
              paymentStatus: "pending",
            },
          },
          {
            $group: {
              _id: null,
              amount: { $sum: "$price" },
            },
          },
        ]);

        // Get job trends
        const jobTrends = await Job.aggregate([
          {
            $match: {
              worker: mongoose.Types.ObjectId(workerId),
              status: "completed",
              completedAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        // Get earnings trends by month
        const earningsTrend = await Job.aggregate([
          {
            $match: {
              worker: mongoose.Types.ObjectId(workerId),
              status: "completed",
              completedAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$completedAt" },
              },
              amount: { $sum: "$price" },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        // Get recent reviews
        const recentReviews = await Review.find({ worker: workerId })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("client", "name")
          .lean();

        // Prepare response
        const stats = {
          jobsCompleted,
          jobsInProgress,
          averageRating: ratingAggregation[0]?.averageRating || 0,
          totalRatings: ratingAggregation[0]?.totalRatings || 0,
          ratingDistribution: ratingAggregation[0]?.ratingDistribution || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
          totalEarnings: earningsAggregation[0]?.totalEarnings || 0,
          totalFees: earningsAggregation[0]?.totalFees || 0,
          avgEarningsPerJob: earningsAggregation[0]?.avgEarningsPerJob || 0,
          pendingEarnings: pendingEarningsAggregation[0]?.amount || 0,
          netEarnings:
            (earningsAggregation[0]?.totalEarnings || 0) -
            (earningsAggregation[0]?.totalFees || 0),
          jobTrends: jobTrends.map((t) => ({ date: t._id, count: t.count })),
          earningsTrend: earningsTrend.map((t) => ({
            month: t._id,
            amount: t.amount,
          })),
          recentReviews: recentReviews.map((r) => ({
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt,
            clientName: r.client?.name || "Anonymous",
          })),
          // Add more stats as needed...
        };

        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
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
