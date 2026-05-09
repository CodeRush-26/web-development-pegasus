import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "captain"],
      required: true,
    },
    receiverId: {
      type: String, // Can be 'admin' or a specific userId
      required: true,
    },
    shipId: {
      type: String, // If associated with a specific ship context
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
