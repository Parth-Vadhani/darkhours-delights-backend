// models/ShopStatus.js
import mongoose from 'mongoose';

const shopStatusSchema = new mongoose.Schema({
    status: { type: String, enum: ["open", "closed"], required: true },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ShopStatus", shopStatusSchema);