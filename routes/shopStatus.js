import express from 'express';
import ShopStatus from '../models/ShopStatus.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { addClient, removeClient, notifySSEClients } from '../middleware/sse.js';

const router = express.Router();

// GET shop status (public)
router.get("/", async (req, res) => {
  try {
    const shopStatus = await ShopStatus.findOne();
    if (!shopStatus) {
      const newStatus = new ShopStatus({ status: "closed" });
      await newStatus.save();
      return res.json(newStatus);
    }
    res.json(shopStatus);
  } catch (error) {
    console.error("Error fetching shop status:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// SSE endpoint for real-time updates
router.get("/stream", (req, res) => {
  const client = { res };
  addClient(client);
  
  req.on('close', () => {
    removeClient(client);
  });
});

// PUT to update shop status (admin only)
router.put("/", authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    console.log("Received status update request with status:", status);
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    // Update shop status
    const result = await ShopStatus.updateOne(
      {},
      { $set: { status, updatedAt: new Date() } },
      { upsert: true }
    );
    
    // Get updated status
    const shopStatus = await ShopStatus.findOne();
    console.log("Updated shop status in database:", shopStatus);
    
    // Notify SSE clients
    notifySSEClients(shopStatus.status);
    
    // Send response
    res.json(shopStatus);
  } catch (error) {
    console.error("Error updating shop status:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;