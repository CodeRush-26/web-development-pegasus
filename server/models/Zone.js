import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  polygon: {
    type: [[Number]],
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  createdBy: {
    type: String,
    default: "system",
  },
});

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
