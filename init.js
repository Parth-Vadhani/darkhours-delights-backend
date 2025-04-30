const mongoose = require("mongoose");
const ShopStatus = require("./models/ShopStatus");

async function initialize() {
    try {
        // Check if shop status exists, create if not
        const shopStatus = await ShopStatus.findOne();
        if (!shopStatus) {
            console.log("Initializing shop status with default value");
            await ShopStatus.create({ status: "closed" });
        }
    } catch (error) {
        console.error("Error initializing shop status:", error);
        process.exit(1);
    }
}

module.exports = initialize;
