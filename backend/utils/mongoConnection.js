import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { getHashedPhoneNumber } from './phoneHasher.js';

export const connectToMongoDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected:", connectionInstance.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

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
    // Stores SHA-1 hashed phone number for privacy
    // Removed unique constraint - users can report multiple potholes
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
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export const newComplaint = async (data) => {
  try {
    // Hash the phone number before storing
    const hashedData = {
      ...data,
      phoneNumber: getHashedPhoneNumber(data.phoneNumber)
    };
    
    const complaint = await Complaint.create(hashedData);
    return complaint;
  } catch (err) {
    console.error("Error creating complaint:", err);
    throw err;
  }
};

// Check rate limiting - max 15 reports per day per user
export const checkRateLimit = async (phoneNumber) => {
  try {
    // Hash the phone number for lookup
    const hashedPhoneNumber = getHashedPhoneNumber(phoneNumber);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    
    const todayComplaints = await Complaint.countDocuments({
      phoneNumber: hashedPhoneNumber,
      timestamp: { $gte: todayTimestamp }
    });
    
    return todayComplaints < 15;
  } catch (err) {
    console.error("Error checking rate limit:", err);
    return false;
  }
};

// Get today's complaint count for a user
export const getTodayComplaintCount = async (phoneNumber) => {
  try {
    // Hash the phone number for lookup
    const hashedPhoneNumber = getHashedPhoneNumber(phoneNumber);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    
    const count = await Complaint.countDocuments({
      phoneNumber: hashedPhoneNumber,
      timestamp: { $gte: todayTimestamp }
    });
    
    return count;
  } catch (err) {
    console.error("Error getting complaint count:", err);
    return 0;
  }
};

// Check for duplicate potholes within 50m radius
export const checkDuplicateLocation = async (latitude, longitude, radiusMeters = 5) => {
  try {
    // Simple distance calculation using Haversine formula
    // For small distances (50m), we can use a simple approximation
    const latDiff = radiusMeters / 111000; // Roughly 111km per degree latitude
    const lngDiff = radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180));
    
    const nearbyComplaints = await Complaint.find({
      latitude: {
        $gte: latitude - latDiff,
        $lte: latitude + latDiff
      },
      longitude: {
        $gte: longitude - lngDiff,
        $lte: longitude + lngDiff
      },
      status: { $ne: 'resolved' } // Only check unresolved complaints
    });
    
    // More precise distance calculation for found candidates
    for (const complaint of nearbyComplaints) {
      const distance = calculateDistance(latitude, longitude, complaint.latitude, complaint.longitude);
      if (distance <= radiusMeters) {
        return {
          isDuplicate: true,
          existingComplaint: complaint,
          distance: Math.round(distance)
        };
      }
    }
    
    return { isDuplicate: false };
  } catch (err) {
    console.error("Error checking duplicate location:", err);
    return { isDuplicate: false };
  }
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // Distance in meters
  return distance;
}

export const getAllComplaints = async () => {
  try {
    // Fetch all complaints but exclude the phoneNumber field
    // Sort by timestamp in descending order (latest first)
    const complaints = await Complaint.find({}, { phoneNumber: 0 }).sort({ timestamp: -1 });
    return complaints;
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return [];
  }
};