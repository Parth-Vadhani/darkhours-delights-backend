const express = require("express");
const router = express.Router();
const ShopStatus = require("../models/ShopStatus");

// SSE endpoint for shop status updates
router.get("/stream", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });

    // Send initial shop status
    const sendStatus = async () => {
        try {
            const shopStatus = await ShopStatus.findOne();
            res.write(`data: ${JSON.stringify({ status: shopStatus?.status || "closed" })}\n\n`);
        } catch (error) {
            console.error("Error sending initial shop status:", error);
        }
    };

    sendStatus();

    // Send updates whenever shop status changes
    const updateShopStatus = async () => {
        const shopStatus = await ShopStatus.findOne();
        res.write(`data: ${JSON.stringify({ status: shopStatus?.status || "closed" })}\n\n`);
    };

    // Close connection when client disconnects
    req.on("close", () => {
        console.log("SSE connection closed");
    });

    // Keep connection alive
    setInterval(() => res.write(`: keep-alive\n\n`), 15000);
});

module.exports = router;
