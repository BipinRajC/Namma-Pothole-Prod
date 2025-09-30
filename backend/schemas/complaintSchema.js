import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false, // Made optional for reports without images
    default: null,
  },
  language: {
    type: String,
    enum: ["english", "kannada"],
    required: true,
  },
  timestamp: {
    type: Number, // UNIX timestamp as requested
    default: () => Math.floor(Date.now() / 1000),
  },
  status: {
    type: String,
    enum: ["reported", "acknowledged", "resolved"],
    default: "reported",
  },
  reportCount: {
    type: Number,
    default: 1,
  },
});

export const Complaint = mongoose.model("Complaint", complaintSchema);
