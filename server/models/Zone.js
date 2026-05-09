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
  // If non-empty, only these ship IDs are blocked from entering this zone.
  // If empty/null, the zone applies to ALL ships.
  restrictedShipIds: {
    type: [String],
    default: [],
  },
});

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
