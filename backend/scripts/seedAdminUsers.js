import "dotenv/config";
import { createAdminUser, getAllAdminUsers } from "../utils/supabaseUtils.js";
import { getAllZones } from "../utils/zoneUtils.js";

/**
 * Seed script to create admin users (Chief Engineers and Superintendent)
 * Run with: node scripts/seedAdminUsers.js
 */

async function seedAdminUsers() {
  console.log("🌱 Seeding admin users...\n");

  try {
    // Check if users already exist
    const existingUsers = await getAllAdminUsers();
    
    if (existingUsers.length > 0) {
      console.log("⚠️  Admin users already exist:");
      existingUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.role}) ${user.zone ? `- ${user.zone}` : ''}`);
      });
      console.log("\nTo re-seed, delete existing users from Supabase first.");
      return;
    }

    const zones = getAllZones();
    const adminUsers = [];

    // Create 10 Chief Engineers (one for each zone)
    for (const zone of zones) {
      const email = `chief.engineer.zone${zone.zoneId}@nammapothole.com`;
      const password = `ChiefZone${zone.zoneId}@2025`; // Change these passwords!
      
      adminUsers.push({
        email,
        password,
        name: `Chief Engineer - ${zone.zoneName}`,
        role: "chief_engineer",
        zone: zone.zoneName,
        zoneId: zone.zoneId,
      });
    }

    // Create 1 Superintendent Engineer
    adminUsers.push({
      email: "superintendent@nammapothole.com",
      password: "Superintendent@2025", // Change this password!
      name: "Superintendent Engineer",
      role: "superintendent_engineer",
      zone: null,
      zoneId: null,
    });

    // Create all users
    console.log("Creating admin users...\n");
    
    for (const userData of adminUsers) {
      const result = await createAdminUser(userData);
      
      if (result.success) {
        console.log(`✅ Created: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Role: ${userData.role}`);
        if (userData.zone) {
          console.log(`   Zone: ${userData.zone} (ID: ${userData.zoneId})`);
        }
        console.log("");
      } else {
        console.log(`❌ Failed to create ${userData.email}: ${result.error}\n`);
      }
    }

    console.log("\n✨ Admin users seeded successfully!");
    console.log("\n⚠️  IMPORTANT: Change these default passwords immediately after first login!");
    console.log("\n📋 Summary:");
    console.log("   - 10 Chief Engineers (one per zone)");
    console.log("   - 1 Superintendent Engineer");
    console.log("\n📧 Login credentials printed above. Save them securely!");
    
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUsers();

