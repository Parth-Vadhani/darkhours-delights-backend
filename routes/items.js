const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // For ObjectId validation
const Item = require("../models/Item");
const authenticateAdmin = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    console.log("Fetched items:", items); // Debug
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { title, price, image, category, stock } = req.body;
    console.log("Creating new item:", { title, price, image, category, stock });

    // Validate required fields
    if (!title || !price || !image || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    // Create new item
    const item = new Item({
      title,
      price,
      image,
      category,
      stock: stock || 0,
      isAvailable: (stock || 0) > 0
    });

    const savedItem = await item.save();
    console.log("Created item:", savedItem);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.put("/:itemId", authenticateAdmin, async (req, res) => {
  try {
    const { stock, isAvailable } = req.body;
    const itemId = req.params.itemId;
    console.log("Updating item with ID:", itemId, "Stock:", stock, "isAvailable:", isAvailable);

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "Invalid stock value" });
    }
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ error: "Invalid isAvailable value" });
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { stock, isAvailable },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    console.log("Updated item:", item);
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.put("/:itemId/stock", authenticateAdmin, async (req, res) => {
  try {
    const { change } = req.body;
    const itemId = req.params.itemId;
    console.log("Updating stock for item:", itemId, "Change:", change);

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }

    if (typeof change !== "number") {
      return res.status(400).json({ error: "Invalid change value" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const newStock = item.stock + change;
    if (newStock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    item.stock = newStock;
    item.isAvailable = newStock > 0;
    await item.save();

    console.log("Updated item stock:", item);
    res.json(item);
  } catch (error) {
    console.error("Error updating item stock:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;