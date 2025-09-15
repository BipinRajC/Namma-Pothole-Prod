import "dotenv/config";
import { putObject, uploadMediaFromWAPI } from "./utils/s3Connection.js";
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
import axios from "axios";
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

// Middleware to parse URL-encoded data (for WAPI webhooks)
app.use(express.urlencoded({ extended: false }));

// WAPI Configuration
const WAPI_BASE_URL = "https://wapi.in.net/api";
const WAPI_VENDOR_UID = process.env.WAPI_VENDOR_UID || "7634c63c-352a-4e2c-a7f4-69c2e0197d5c";
const WAPI_BEARER_TOKEN = process.env.WAPI_BEARER_TOKEN;
const WAPI_PHONE_NUMBER_ID = process.env.WAPI_PHONE_NUMBER_ID || "694623017079100";

// Configure axios for WAPI
const wapiClient = axios.create({
  baseURL: WAPI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${WAPI_BEARER_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

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

// State constants
const STATES = {
  LANGUAGE_SELECTION: 'language_selection',
  AWAITING_LOCATION: 'awaiting_location',
  AWAITING_IMAGE_CHOICE: 'awaiting_image_choice',
  AWAITING_IMAGE: 'awaiting_image'
};


// Main WhatsApp webhook endpoint for WAPI
app.post("/whatsapp", async (req, res) => {
  try {
    console.log('Received WAPI webhook:', JSON.stringify(req.body, null, 2));
    
    // Process incoming messages from WAPI webhook
    // WAPI webhook structure: { contact: {...}, message: {...}, whatsapp_webhook_payload: {...} }
    if (req.body.contact && req.body.message && req.body.message.is_new_message) {
      const contact = req.body.contact;
      const message = req.body.message;
      const whatsappPayload = req.body.whatsapp_webhook_payload;
      
      await handleWAPIMessage(contact, message, whatsappPayload);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('WAPI webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle incoming WhatsApp message via WAPI
async function handleWAPIMessage(contact, message, whatsappPayload) {
  try {
    const phoneNumber = contact.phone_number;
    
    console.log(`Processing message from ${phoneNumber}:`, message);
    
    // Get or create session
    let session = await getSession(phoneNumber);
    if (!session) {
      session = { 
        language: null, 
        state: STATES.LANGUAGE_SELECTION
      };
      await setSession(phoneNumber, session);
    }

    // Extract message data based on type
    let messageData = {
      body: message.body,
      latitude: null,
      longitude: null,
      mediaUrl: null,
      mediaType: null
    };

    // Parse different message types from WAPI webhook
    if (whatsappPayload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const waMessage = whatsappPayload.entry[0].changes[0].value.messages[0];
      
      switch (waMessage.type) {
        case 'text':
          messageData.body = waMessage.text?.body;
          break;
        case 'location':
          messageData.latitude = waMessage.location?.latitude;
          messageData.longitude = waMessage.location?.longitude;
          break;
        case 'image':
          messageData.mediaUrl = message.media?.link;
          messageData.mediaType = 'image';
          break;
      }
    }

    // Handle initial greeting or restart
    if (messageData.body && (
      messageData.body.toLowerCase().includes('hi') || 
      messageData.body.toLowerCase().includes('hello') || 
      messageData.body.toLowerCase().includes('namaste')
    )) {
      session.state = STATES.LANGUAGE_SELECTION;
      await setSession(phoneNumber, session);
      return sendLanguageSelection(phoneNumber);
    }

    // Route to appropriate handler based on state
    switch (session.state) {
      case STATES.LANGUAGE_SELECTION:
        await handleLanguageSelection(session, phoneNumber, messageData.body);
        break;
        
      case STATES.AWAITING_LOCATION:
        await handleLocationInput(session, phoneNumber, messageData.latitude, messageData.longitude);
        break;
        
      case STATES.AWAITING_IMAGE_CHOICE:
        await handleImageChoice(session, phoneNumber, messageData.body);
        break;
        
      case STATES.AWAITING_IMAGE:
        await handleImageInput(session, phoneNumber, messageData.mediaUrl, messageData.mediaType);
        break;
        
        default:
          return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error('Error handling WAPI message:', error);
    await sendErrorMessage(phoneNumber, 'english');
  }
}

// Send media message using WAPI
async function sendMediaMessage(phoneNumber, messageBody, mediaUrl, mediaType = 'image', caption = null) {
  try {
    const payload = {
      from_phone_number_id: WAPI_PHONE_NUMBER_ID,
      phone_number: phoneNumber,
      media_type: mediaType, 
      media_url: mediaUrl,
      caption: caption || messageBody
    };

    const response = await wapiClient.post(`/${WAPI_VENDOR_UID}/contact/send-media-message`, payload);
    console.log('Media message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending media message:', error.response?.data || error.message);
    throw error;
  }
}

// Send normal message using WAPI
async function sendWAPIMessage(phoneNumber, messageBody) {
  try {
    const payload = {
      from_phone_number_id: WAPI_PHONE_NUMBER_ID,
      phone_number: phoneNumber,
      message_body: messageBody
    };

    const response = await wapiClient.post(`/${WAPI_VENDOR_UID}/contact/send-message`, payload);
    console.log('WAPI message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending WAPI message:', error.response?.data || error.message);
    throw error;
  }
}

// Send language selection using normal text message
async function sendLanguageSelection(phoneNumber) {
  await sendWAPIMessage(phoneNumber, `🙏 ನಮಸ್ಕಾರ!\n\nWelcome to *Namma Bengaluru Pothole Reporter*! 🛣️\n\nHelp make our city's roads better by reporting potholes to BBMP.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:\n\n1️⃣ English\n2️⃣ ಕನ್ನಡ (Kannada)\n\n_Type the number or language name_`);
}

// Handle language selection
async function handleLanguageSelection(session, phoneNumber, response) {
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
        
        if (selectedLanguage === 'kannada') {
          await sendWAPIMessage(phoneNumber, `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.\n\nನಮಸ್ಕಾರ! 🙏`);
        } else {
          await sendWAPIMessage(phoneNumber, `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.\n\nNamaste! 🙏`);
        }
        return;
      }
      
      session.language = selectedLanguage;
      session.state = STATES.AWAITING_LOCATION;
      await setSession(phoneNumber, session);
      return requestLocation(phoneNumber, selectedLanguage);
    } else {
      return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error('Error in handleLanguageSelection:', error);
    await sendWAPIMessage(phoneNumber, 'Sorry, something went wrong. Please type "Hi" to start again.');
  }
}

// Request location using media message with helper image
async function requestLocation(phoneNumber, language) {
  const imageUrl = process.env.LOCATION_HELP_IMAGE_URL;
  
  if (language === 'kannada') {
    await sendMediaMessage(
      phoneNumber,
      `🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗಂಡಿ ವರದಿ*\n\n📍 ದಯವಿಟ್ಟು ಗಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Location* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 *Send your current location* ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠️ _ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ_`,
      imageUrl,
      'image'
    );
  } else {
    await sendMediaMessage(
      phoneNumber,
      `🛣️ *Namma Bengaluru Pothole Report*\n\n📍 Please share the pothole location:\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Location*\n🔹 Click *Send your current location*\n🔹 Move the marker to exact pothole spot\n\n⚠️ _Only locations within Bengaluru city limits accepted_\n\n🏛️ Your report will be sent to BBMP for action.`,
      imageUrl,
      'image'
    );
  }
}

// Handle location input
async function handleLocationInput(session, phoneNumber, latitude, longitude) {
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isWithinBangalore(lat, lng)) {
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, '❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.');
      } else {
        await sendWAPIMessage(phoneNumber, '❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.');
      }
      return;
    }
    
    // Check for duplicate potholes
    const duplicateCheck = await checkDuplicateLocation(lat, lng);
    
    if (duplicateCheck.isDuplicate) {
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, `⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ ಗಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ ಗಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 _BBMP ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`);
      } else {
        await sendWAPIMessage(phoneNumber, `⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _BBMP is already working on this report_`);
      }
      
      // Reset to language selection for new report
      session.state = STATES.LANGUAGE_SELECTION;
      await setSession(phoneNumber, session);
      return;
    }
    
    // Store location in session
    session.latitude = lat;
    session.longitude = lng;
    session.state = STATES.AWAITING_IMAGE_CHOICE;
    await setSession(phoneNumber, session);
    
    return requestImageChoice(phoneNumber, session.language);
  } else {
    return requestLocation(phoneNumber, session.language);
  }
}

// Request image choice using normal text message
async function requestImageChoice(phoneNumber, language) {
  if (language === 'kannada') {
    await sendWAPIMessage(phoneNumber, `📸 *ಗಂಡಿಯ ಫೋಟೋ*\n\nದಯವಿಟ್ಟು ಗಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?\n\n✅ *1 - ಹೌದು* (ಶಿಫಾರಸು)\n❌ *2 - ಬೇಡ*\n\n💡 _ಫೋಟೋ ಇರುವುದರಿಂದ BBMP ಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ_\n\n_Type 1 or 2_`);
  } else {
    await sendWAPIMessage(phoneNumber, `📸 *Pothole Photo*\n\nWould you like to upload a photo of the pothole?\n\n✅ *1 - Yes* (Recommended)\n❌ *2 - No*\n\n💡 _Photos help BBMP assess the severity better_\n\n_Type 1 or 2_`);
  }
}

// Handle image choice
async function handleImageChoice(session, phoneNumber, response) {
  try {
    if (response === '1' || response?.toLowerCase().includes('yes') || response?.toLowerCase().includes('ಹೌದು')) {
      session.state = STATES.AWAITING_IMAGE;
      await setSession(phoneNumber, session);
      return requestImage(phoneNumber, session.language);
    } else if (response === '2' || response?.toLowerCase().includes('no') || response?.toLowerCase().includes('ಬೇಡ')) {
      // Skip image upload and save complaint without image
      return submitComplaintWithoutImage(session, phoneNumber);
    } else {
      return requestImageChoice(phoneNumber, session.language);
    }
  } catch (error) {
    console.error('Error in handleImageChoice:', error);
    await sendWAPIMessage(phoneNumber, 'Something went wrong. Please type "Hi" to start again.');
  }
}

// Request image with normal text message
async function requestImage(phoneNumber, language) {
  if (language === 'kannada') {
    await sendWAPIMessage(phoneNumber, `📸 *ಗಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n• ಗಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n• ಗಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`);
  } else {
    await sendWAPIMessage(phoneNumber, `📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`);
  }
}

// Submit complaint without image
async function submitComplaintWithoutImage(session, phoneNumber) {
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
    session.state = STATES.LANGUAGE_SELECTION;
    await setSession(phoneNumber, session);
    
    if (session.language === 'kannada') {
      await sendWAPIMessage(phoneNumber, `✅ *ಗಂಡಿ ವರದಿ ಸಫಲವಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`);
    } else {
      await sendWAPIMessage(phoneNumber, `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`);
    }
    
  } catch (error) {
    console.error('Error submitting complaint without image:', error);
    if (session.language === 'kannada') {
      await sendWAPIMessage(phoneNumber, '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } else {
      await sendWAPIMessage(phoneNumber, '❌ Technical error occurred. Please type "Hi" to try again.');
    }
  }
}

// Handle image input with compression and save complaint
async function handleImageInput(session, phoneNumber, mediaUrl, mediaType) {
  if (mediaUrl && mediaType === 'image') {
    try {
      // Send processing message first
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, '⏳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ...');
      } else {
        await sendWAPIMessage(phoneNumber, '⏳ Uploading and compressing photo... Please wait...');
      }
      
      // Generate complaint ID first
      const complaintId = uuidv4();
      
      // Upload and compress image to S3 (need to adapt for WAPI URL)
      const s3ImageUrl = await uploadMediaFromWAPI(mediaUrl, complaintId);
      
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
      session.state = STATES.LANGUAGE_SELECTION;
      await setSession(phoneNumber, session);
      
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, `✅ *ಗಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`);
      } else {
        await sendWAPIMessage(phoneNumber, `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`);
      }
      
    } catch (error) {
      console.error('Error saving complaint with image:', error);
      
      // Reset session state on error
      session.state = STATES.LANGUAGE_SELECTION;
      await setSession(phoneNumber, session);
      
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, '❌ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಫೋಟೋ ಇಲ್ಲದೇ ವರದಿ ಮಾಡಲೂ ಬಹುದು');
      } else {
        await sendWAPIMessage(phoneNumber, '❌ Error uploading photo. \n\n🔄 Please type "Hi" to try again\n\n💡 You can also report without photo');
      }
    }
  } else {
    // Invalid file type
    if (session.language === 'kannada') {
      await sendWAPIMessage(phoneNumber, '❌ ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ\n\n📸 ಮಾನ್ಯ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: JPG, PNG, WEBP');
    } else {
      await sendWAPIMessage(phoneNumber, '❌ Please send a valid image file\n\n📸 Supported formats: JPG, PNG, WEBP');
    }
  }
}


// Send error message
async function sendErrorMessage(phoneNumber, language) {
  if (language === 'kannada') {
    await sendWAPIMessage(phoneNumber, '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
  } else {
    await sendWAPIMessage(phoneNumber, '❌ Technical error occurred. Please type "Hi" to try again.');
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    service: "WAPI WhatsApp Bot",
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "WAPI WhatsApp Bot Server is running!",
    endpoints: {
      webhook: "/whatsapp",
      health: "/health"
    }
  });
});

// API endpoints for frontend
app.get("/api/complaints", async (req, res) => {
  try {
    await connectToMongoDB();
    const complaints = await getAllComplaints();
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Connect to databases on startup
connectToMongoDB().then(() => {
  console.log('Connected to MongoDB');
}).catch(console.error);

connectToRedis().then(() => {
  console.log('Connected to Redis');
}).catch(console.error);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WAPI WhatsApp Bot server is running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WAPI WhatsApp Bot server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down WAPI WhatsApp Bot server...');
  process.exit(0);
});