const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const ShopStatus = require("../models/ShopStatus");
const authenticateUser = require("../middleware/auth");
const authenticateAdmin = require("../middleware/auth");
const admin = require("firebase-admin");

// Helper function to check shop status
const checkShopStatus = async () => {
    const shopStatus = await ShopStatus.findOne();
    if (!shopStatus || shopStatus.status === "closed") {
        throw new Error("Shop is currently closed. Please try again later.");
    }
};

// POST to create a new order
router.post("/", authenticateUser, async (req, res) => {
  try {
    // Check shop status before processing order
    await checkShopStatus();

    const { phone, room, block, floor } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    // Validate required fields
    if (!phone || !room || !block || !floor) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create order
    const order = new Order({
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userEmail,
      timestamp: new Date(),
      total: req.body.total,
      items: req.body.items,
      phone,
      room,
      block,
      floor,
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.message === "Shop is currently closed. Please try again later.") {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create order",
        details: error.message
      });
    }
  }
});

// GET to fetch order history for the authenticated user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.uid }).sort({ timestamp: -1 });
    console.log("Fetched orders for user:", req.user.uid, orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Failed to fetch order history", details: error.message });
  }
});

// GET to fetch a single order by ID
router.get("/:orderId", authenticateUser, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order", details: error.message });
  }
});

// GET to fetch all orders for a specific user (admin only)
router.get("/user/:userId", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    console.log("Fetched orders for user:", req.params.userId, orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders for user:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// GET to fetch all orders for a specific email (admin only)
router.get("/email/:email", authenticateAdmin, async (req, res) => {
  try {
    // Get user ID from email
    const user = await admin.auth().getUserByEmail(req.params.email);
    const orders = await Order.find({ userId: user.uid }).sort({ timestamp: -1 });
    console.log("Fetched orders for email:", req.params.email, orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders for email:", error);
    if (error.code === "auth/user-not-found") {
      res.status(404).json({ error: "User not found with this email" });
    } else {
      res.status(500).json({ error: "Failed to fetch orders", details: error.message });
    }
  }
});

// GET to fetch all orders with pagination (admin only)
router.get("/all/:page", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      Order.countDocuments()
    ]);

    // Get user phone numbers for each order
    const ordersWithPhone = orders.map(order => ({
      ...order.toObject(),
      phone: order.phone
    }));

    res.json({
      orders: ordersWithPhone,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// GET to fetch orders by phone number (admin only)
router.get("/phone/:phone", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).sort({ timestamp: -1 });
    console.log("Fetched orders for phone:", req.params.phone, orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders for phone:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

module.exports = router;