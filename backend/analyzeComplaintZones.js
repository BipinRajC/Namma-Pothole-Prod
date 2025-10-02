import dotenv from "dotenv";
import { connectToMongoDB, getAllComplaints } from "./utils/mongoUtils.js";
import { getZoneFromCoordinates } from "./utils/geoUtils.js";

// Load environment variables
dotenv.config();

async function analyzeComplaintZones() {
  try {
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();
    console.log("Connected successfully!\n");

    console.log("Fetching all complaints...");
    const complaints = await getAllComplaints();
    console.log(`Found ${complaints.length} complaints\n`);

    if (complaints.length === 0) {
      console.log("No complaints found in the database.");
      process.exit(0);
    }

    console.log("Analyzing complaint zones...\n");
    console.log("=".repeat(80));

    // Statistics counters
    let complaintsWithZone = 0;
    let complaintsWithoutZone = 0;
    const zoneStats = {};

    // Loop through all complaints
    for (let i = 0; i < complaints.length; i++) {
      const complaint = complaints[i];
      const { complaintId, latitude, longitude, status, timestamp } = complaint;

      // Get zone information for this complaint
      const zoneInfo = getZoneFromCoordinates(latitude, longitude);

      // Print complaint details
      console.log(`\nComplaint #${i + 1}`);
      console.log(`  ID: ${complaintId}`);
      console.log(`  Coordinates: ${latitude}, ${longitude}`);
      console.log(`  Status: ${status}`);
      console.log(`  Reported: ${new Date(timestamp * 1000).toLocaleString()}`);

      if (zoneInfo) {
        console.log(`  Zone: ${zoneInfo.zone || "N/A"}`);
        console.log(`  Corporation: ${zoneInfo.corporation || "N/A"}`);
        console.log(`  Zone ID: ${zoneInfo.zoneId}`);
        complaintsWithZone++;

        // Update zone statistics
        const zoneName = zoneInfo.zone || "Unknown";
        if (!zoneStats[zoneName]) {
          zoneStats[zoneName] = {
            count: 0,
            corporation: zoneInfo.corporation,
          };
        }
        zoneStats[zoneName].count++;
      } else {
        console.log(`  Zone: NOT FOUND (outside all defined zones)`);
        complaintsWithoutZone++;
      }

      console.log("-".repeat(80));
    }

    // Print summary statistics
    console.log("\n" + "=".repeat(80));
    console.log("SUMMARY STATISTICS");
    console.log("=".repeat(80));
    console.log(`Total Complaints: ${complaints.length}`);
    console.log(`Complaints with Zone: ${complaintsWithZone}`);
    console.log(`Complaints without Zone: ${complaintsWithoutZone}`);
    console.log(
      `Coverage: ${((complaintsWithZone / complaints.length) * 100).toFixed(
        2
      )}%`
    );

    // Print zone-wise breakdown
    console.log("\n" + "=".repeat(80));
    console.log("ZONE-WISE BREAKDOWN");
    console.log("=".repeat(80));

    const sortedZones = Object.entries(zoneStats).sort(
      (a, b) => b[1].count - a[1].count
    );

    for (const [zoneName, stats] of sortedZones) {
      console.log(
        `${zoneName} (${stats.corporation}): ${stats.count} complaints`
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log("Analysis complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error analyzing complaint zones:", error);
    process.exit(1);
  }
}

// Run the analysis
analyzeComplaintZones();
