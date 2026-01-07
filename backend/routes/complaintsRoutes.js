import express from "express";
import { getAllComplaints } from "../utils/mongoUtils.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const complaints = await getAllComplaints();
    res.json({
      success: true,
      data: complaints,
      count: complaints.length,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch complaints",
    });
  }
});

export default router;
