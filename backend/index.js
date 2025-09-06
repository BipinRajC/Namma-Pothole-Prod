import "dotenv/config";
import { putObject, uploadMediaFromTwilio } from "./utils/s3Connection.js";
import { 
  connectToMongoDB, 
  newComplaint, 
  checkRateLimit, 
  getAllComplaints,
  getTodayComplaintCount,
  checkDuplicateLocation 
} from "./utils/mongoConnection.js";

import {
  connectToRedis,
  setSession,
  getSession,
} from "./utils/redisConnection.js";
import express from "express";
import twilio from "twilio";
import { v4 as uuidv4 } from 'uuid';
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:8080", // Development frontend
  "http://localhost:3001", // Development frontend alternative
  process.env.FRONTEND_URL || "https://nammapothole.com", // Production frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Middleware to parse URL-encoded data (for Twilio webhooks)
app.use(express.urlencoded({ extended: false }));

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Bangalore boundaries for geo-validation
const BANGALORE_BOUNDARIES = {
  north: 13.1394,
  south: 12.7925,
  east: 77.7824,
  west: 77.3764
};

// Check if coordinates are within Bangalore
function isWithinBangalore(lat, lng) {
  return lat >= BANGALORE_BOUNDARIES.south && 
         lat <= BANGALORE_BOUNDARIES.north && 
         lng >= BANGALORE_BOUNDARIES.west && 
         lng <= BANGALORE_BOUNDARIES.east;
}

// Main WhatsApp webhook endpoint
app.post("/whatsapp", async (req, res) => {
  const { MessagingResponse } = twilio.twiml;
  const twiml = new MessagingResponse();
  
  try {
    const {
      From: from,
      Body: body,
      ButtonText: buttonText,
      Latitude: latitude,
      Longitude: longitude,
      MediaUrl0: mediaUrl,
      MediaContentType0: mediaContentType,
      ProfileName: profileName
    } = req.body;

    // Extract phone number without whatsapp: prefix
    const phoneNumber = from.replace('whatsapp:', '');
    
    // Get or create session
    let session = await getSession(phoneNumber);
    if (!session) {
      session = { 
        language: null, 
        state: 'language_selection',
        phoneNumber: phoneNumber,
        profileName: profileName || 'User'
      };
      await setSession(phoneNumber, session);
    }

    await handleWhatsAppMessage(twiml, session, phoneNumber, {
      body,
      buttonText,
      latitude,
      longitude,
      mediaUrl,
      mediaContentType
    });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    const message = twiml.message();
    message.body('Sorry, something went wrong. Please try again.');
  }

  res.type('text/xml').send(twiml.toString());
});

// Handle WhatsApp message flow
async function handleWhatsAppMessage(twiml, session, phoneNumber, messageData) {
  const { body, buttonText, latitude, longitude, mediaUrl, mediaContentType } = messageData;
  
  // Handle initial greeting or restart
  if (body && (body.toLowerCase().includes('hi') || body.toLowerCase().includes('hello') || body.toLowerCase().includes('namaste'))) {
    session.state = 'language_selection';
    await setSession(phoneNumber, session);
    return sendLanguageSelection(twiml, session.profileName);
  }

  switch (session.state) {
    case 'language_selection':
      await handleLanguageSelection(twiml, session, phoneNumber, buttonText || body);
      break;
      
    case 'awaiting_location':
      await handleLocationInput(twiml, session, phoneNumber, latitude, longitude);
      break;
      
    case 'awaiting_image_choice':
      await handleImageChoice(twiml, session, phoneNumber, buttonText || body);
      break;
      
    case 'awaiting_image':
      await handleImageInput(twiml, session, phoneNumber, mediaUrl, mediaContentType);
      break;
      
    default:
      return sendLanguageSelection(twiml, session.profileName);
  }
}

// Send language selection with improved messaging
function sendLanguageSelection(twiml, profileName = 'User') {
  const message = twiml.message();
  message.body(`🙏 ನಮಸ್ಕಾರ ${profileName}!\n\nWelcome to *Namma Bengaluru Pothole Reporter*! 🛣️\n\nHelp make our city's roads better by reporting potholes to BBMP.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:\n\n1️⃣ English\n2️⃣ ಕನ್ನಡ (Kannada)\n\n_Type the number or language name_`);
  
  // TODO: In production, use Content Templates with quick reply buttons
  // This will make the interface more aesthetic with actual buttons
}

// Handle language selection - now goes directly to location request
async function handleLanguageSelection(twiml, session, phoneNumber, response) {
  try {
    let selectedLanguage = null;
    
    if (response) {
      const text = response.toLowerCase();
      if (text.includes('english') || text === '1') {
        selectedLanguage = 'english';
      } else if (text.includes('kannada') || text.includes('ಕನ್ನಡ') || text === '2') {
        selectedLanguage = 'kannada';
      }
    }
    
    if (selectedLanguage) {
      // Check rate limiting before proceeding
      const canReport = await checkRateLimit(phoneNumber);
      
      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        const message = twiml.message();
        
        if (selectedLanguage === 'kannada') {
          message.body(`❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.\n\nನಮಸ್ಕಾರ! 🙏`);
        } else {
          message.body(`❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.\n\nNamaste! 🙏`);
        }
        return;
      }
      
      session.language = selectedLanguage;
      session.state = 'awaiting_location';
      await setSession(phoneNumber, session);
      return requestLocation(twiml, selectedLanguage);
    } else {
      return sendLanguageSelection(twiml, session.profileName);
    }
  } catch (error) {
    console.error('Error in handleLanguageSelection:', error);
    const message = twiml.message();
    message.body('Sorry, something went wrong. Please type "Hi" to start again.');
  }
}

// Main menu functions removed - flow now goes directly from language to location

// Request location with improved Bangalore-centric messaging
function requestLocation(twiml, language) {
  const message = twiml.message();
  
  if (language === 'kannada') {
    message.body(`🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗಂಡಿ ವರದಿ*\n\n📍 ದಯವಿಟ್ಟು ಗಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Location* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 *Send your current location* ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠️ _ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ_`);
  } else {
    message.body(`🛣️ *Namma Bengaluru Pothole Report*\n\n📍 Please share the pothole location:\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Location*\n🔹 Click *Send your current location*\n🔹 Move the marker to exact pothole spot\n\n⚠️ _Only locations within Bengaluru city limits accepted_\n\n🏛️ Your report will be sent to BBMP for action.`);
  }
}

// Handle location input
async function handleLocationInput(twiml, session, phoneNumber, latitude, longitude) {
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isWithinBangalore(lat, lng)) {
      const message = twiml.message();
      if (session.language === 'kannada') {
        message.body('❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.');
      } else {
        message.body('❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.');
      }
      return;
    }
    
    // Check for duplicate potholes
    const duplicateCheck = await checkDuplicateLocation(lat, lng);
    
    if (duplicateCheck.isDuplicate) {
      const message = twiml.message();
      if (session.language === 'kannada') {
        message.body(`⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ ಗಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ ಗಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 _BBMP ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`);
      } else {
        message.body(`⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _BBMP is already working on this report_`);
      }
      
      // Reset to language selection for new report
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      return;
    }
    
    // Store location in session
    session.latitude = lat;
    session.longitude = lng;
    session.state = 'awaiting_image_choice';
    await setSession(phoneNumber, session);
    
    return requestImageChoice(twiml, session.language);
  } else {
    return requestLocation(twiml, session.language);
  }
}

// Request image choice (Yes/No for uploading image)
function requestImageChoice(twiml, language) {
  const message = twiml.message();
  
  if (language === 'kannada') {
    message.body(`📸 *ಗಂಡಿಯ ಫೋಟೋ*\n\nದಯವಿಟ್ಟು ಗಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?\n\n✅ *1 - ಹೌದು* (ಶಿಫಾರಸು)\n❌ *2 - ಬೇಡ*\n\n💡 _ಫೋಟೋ ಇರುವುದರಿಂದ BBMP ಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ_\n\n_Type 1 or 2_`);
  } else {
    message.body(`📸 *Pothole Photo*\n\nWould you like to upload a photo of the pothole?\n\n✅ *1 - Yes* (Recommended)\n❌ *2 - No*\n\n💡 _Photos help BBMP assess the severity better_\n\n_Type 1 or 2_`);
  }
}

// Handle image choice
async function handleImageChoice(twiml, session, phoneNumber, response) {
  try {
    if (response === '1' || response.toLowerCase().includes('yes') || response.toLowerCase().includes('ಹೌದು')) {
      session.state = 'awaiting_image';
      await setSession(phoneNumber, session);
      return requestImage(twiml, session.language);
    } else if (response === '2' || response.toLowerCase().includes('no') || response.toLowerCase().includes('ಬೇಡ')) {
      // Skip image upload and save complaint without image
      return submitComplaintWithoutImage(twiml, session, phoneNumber);
    } else {
      return requestImageChoice(twiml, session.language);
    }
  } catch (error) {
    console.error('Error in handleImageChoice:', error);
    const message = twiml.message();
    message.body('Something went wrong. Please type "Hi" to start again.');
  }
}

// Submit complaint without image
async function submitComplaintWithoutImage(twiml, session, phoneNumber) {
  try {
    const complaintId = uuidv4();
    
    const complaintData = {
      complaintId: complaintId,
      phoneNumber: phoneNumber,
      latitude: session.latitude,
      longitude: session.longitude,
      imageUrl: null, // No image uploaded
      language: session.language
    };
    
    const complaint = await newComplaint(complaintData);
    
    // Reset session
    session.state = 'language_selection';
    await setSession(phoneNumber, session);
    
    const message = twiml.message();
    if (session.language === 'kannada') {
      message.body(`✅ *ಗಂಡಿ ವರದಿ ಸಫಲವಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`);
    } else {
      message.body(`✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`);
    }
    
  } catch (error) {
    console.error('Error submitting complaint without image:', error);
    const message = twiml.message();
    if (session.language === 'kannada') {
      message.body('❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } else {
      message.body('❌ Technical error occurred. Please type "Hi" to try again.');
    }
  }
}

// Request image with improved instructions
function requestImage(twiml, language) {
  const message = twiml.message();
  
  if (language === 'kannada') {
    message.body(`📸 *ಗಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n• ಗಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n• ಗಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`);
  } else {
    message.body(`📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`);
  }
}

// Handle image input with compression and save complaint
async function handleImageInput(twiml, session, phoneNumber, mediaUrl, mediaContentType) {
  if (mediaUrl && mediaContentType && mediaContentType.startsWith('image/')) {
    try {
      // Send processing message first
      const processingMsg = twiml.message();
      if (session.language === 'kannada') {
        processingMsg.body('⏳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ...');
      } else {
        processingMsg.body('⏳ Uploading and compressing photo... Please wait...');
      }
      
      // Generate complaint ID first
      const complaintId = uuidv4();
      
      // Upload and compress image to S3
      const s3ImageUrl = await uploadMediaFromTwilio(mediaUrl, complaintId);
      
      if (!s3ImageUrl) {
        throw new Error('Failed to upload image to S3');
      }
      
      const complaintData = {
        complaintId: complaintId,
        phoneNumber: phoneNumber,
        latitude: session.latitude,
        longitude: session.longitude,
        imageUrl: s3ImageUrl,
        language: session.language
      };
      
      const complaint = await newComplaint(complaintData);
      
      // Reset session to allow new reports
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      
      const message = twiml.message();
      if (session.language === 'kannada') {
        message.body(`✅ *ಗಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`);
      } else {
        message.body(`✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`);
      }
      
    } catch (error) {
      console.error('Error saving complaint with image:', error);
      
      // Reset session state on error
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      
      const message = twiml.message();
      if (session.language === 'kannada') {
        message.body('❌ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಫೋಟೋ ಇಲ್ಲದೇ ವರದಿ ಮಾಡಲೂ ಬಹುದು');
      } else {
        message.body('❌ Error uploading photo. \n\n🔄 Please type "Hi" to try again\n\n💡 You can also report without photo');
      }
    }
  } else {
    // Invalid file type
    const message = twiml.message();
    if (session.language === 'kannada') {
      message.body('❌ ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ\n\n📸 ಮಾನ್ಯ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: JPG, PNG, WEBP');
    } else {
      message.body('❌ Please send a valid image file\n\n📸 Supported formats: JPG, PNG, WEBP');
    }
  }
}

/*
 * TODO: PRODUCTION MESSAGE TEMPLATES
 * 
 * For production deployment with approved WhatsApp Business number,
 * implement proper message templates with interactive buttons:
 * 
 * 1. Language Selection Template:
 *    - Quick reply buttons: "English" | "ಕನ್ನಡ"
 * 
 * 2. Image Choice Template:
 *    - Quick reply buttons: "Yes, Upload Photo" | "No, Skip Photo"
 * 
 * 3. Quick Actions Template:
 *    - Call to action button: "Report Another Pothole"
 *    - URL button: "View BBMP Status"
 * 
 * Use Twilio Content Template Builder:
 * https://console.twilio.com/us1/develop/sms/content-template-builder
 * 
 * Reference: /docs-scrape/buttons.md
 */

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Namma Pothole WhatsApp Bot is running",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for Redis sessions
app.get("/redisTest", async (req, res) => {
  const sessionId = req.query.sessionId;
  const session = await getSession(sessionId);
  if (session) {
    return res.json({ session, message: "Session Found" });
  }

  const sessionData = { language: "Kannada", state: 0 };
  if (!setSession(sessionId, sessionData)) {
    return res.json({ error: "Failed to set session" });
  } else {
    return res.json({ session: sessionData, message: "new session set" });
  }
});

async function startServer() {
  await connectToMongoDB();
  await connectToRedis();
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

  // const url = await putObject("test-image.jpeg", "test-image.jpeg");
  // const complaint = {
  //   phoneNumber: "1234567890",
  //   latitude: 12.9716,
  //   longitude: 77.5946,
  //   imageUrl: url,
  // };
  // const createdComplaint = await newComplaint(complaint);
  // console.log(createdComplaint);
}
app.get("/complaints", async (req, res) => {
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
})
startServer();

