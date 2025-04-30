import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import admin from 'firebase-admin';
import shopStatusRoutes from './routes/shopStatus.js';
import items from './routes/items.js';
import order from './routes/order.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
}

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Format the private key properly
    if (serviceAccount.private_key) {
        // Remove any existing newlines and add proper ones
        serviceAccount.private_key = serviceAccount.private_key
            .replace(/\\n/g, '\n')
            .replace(/\n/g, '\\n')
            .replace(/\\n/g, '\n');
    }

    console.log('Initializing Firebase with service account:', {
        project_id: serviceAccount.project_id,
        client_email: serviceAccount.client_email
    });

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Service Account:', process.env.FIREBASE_SERVICE_ACCOUNT);
    throw error;
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