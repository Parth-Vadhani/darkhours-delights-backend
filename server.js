require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const shopStatusRoutes = require("./routes/shopStatus");
const items = require("./routes/items");
const order = require("./routes/order");

const app = express();

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require("./firebase-service-account.json");
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/shopStatus", shopStatusRoutes);
app.use("/api/items", items);
app.use("/api/orders", order);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/darkhoursdelight";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connection.on("open", async () => {
  console.log("Connected to MongoDB");
  console.log("Connected to database:", mongoose.connection.db.databaseName);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections in database:", collections.map((c) => c.name));
  const itemCount = await mongoose.model("Item").countDocuments();
  console.log("Number of items in 'items' collection:", itemCount);
  const orderCount = await mongoose.model("Order").countDocuments().catch((e) => {
    console.log("Order collection not found, likely uninitialized:", e.message);
    return 0;
  });
  console.log("Number of orders in 'orders' collection:", orderCount);
});