import "dotenv/config";
import { putObject, uploadMediaFromDialog360 } from "./utils/s3Connection.js";
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

// Middleware to parse URL-encoded data (for Dialog360 webhooks)
app.use(express.urlencoded({ extended: false }));

// Dialog360 Configuration
const DIALOG360_BASE_URL = process.env.DIALOG360_BASE_URL;
const DIALOG360_API_KEY = process.env.DIALOG360_API_KEY;

// Configure axios for Dialog360 API
const dialog360Client = axios.create({
  baseURL: DIALOG360_BASE_URL,
  headers: {
    'D360-API-KEY': DIALOG360_API_KEY,
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

// Template names (only the available approved templates)
const TEMPLATES = {
  WELCOME_KANNADA: 'welcome_kannada',
  LOCATION_REQUEST_EN: 'location_english',
  LOCATION_REQUEST_KN: 'location_kannada',
  IMAGE_CHOICE_EN: 'image_choice_english',
  IMAGE_CHOICE_KN: 'image_choice_kannada'
};

// Main WhatsApp webhook endpoint for Dialog360
app.post("/whatsapp", async (req, res) => {
  try {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));
    
    // Dialog360 webhook verification
    if (req.body.hub && req.body.hub.mode === 'subscribe') {
      if (req.body.hub.verify_token === process.env.WEBHOOK_VERIFY_TOKEN) {
        return res.status(200).send(req.body.hub.challenge);
      } else {
        return res.status(403).send('Forbidden');
      }
    }

    // Process incoming messages
    if (req.body.object === 'whatsapp_business_account') {
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (changes?.field === 'messages' && value?.messages) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];
        
        await handleWhatsAppMessage(message, contact);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle WhatsApp message flow with Dialog360
async function handleWhatsAppMessage(message, contact) {
  try {
    const phoneNumber = message.from;
    
    // Get or create session
    let session = await getSession(phoneNumber);
    if (!session) {
      session = { 
        language: null, 
        state: 'language_selection',
        phoneNumber: phoneNumber,
      };
      await setSession(phoneNumber, session);
    }

    // Extract message data based on type
    let messageData = {
      body: null,
      buttonId: null,
      latitude: null,
      longitude: null,
      mediaId: null,
      mediaType: null
    };

    switch (message.type) {
      case 'text':
        messageData.body = message.text?.body;
        console.log(`Text message received: "${messageData.body}"`);
        break;
      case 'interactive':
        if (message.interactive?.type === 'button_reply') {
          messageData.buttonId = message.interactive.button_reply?.id;
          console.log(`Button reply received: "${messageData.buttonId}"`);
        } else if (message.interactive?.type === 'list_reply') {
          messageData.buttonId = message.interactive.list_reply?.id;
          console.log(`List reply received: "${messageData.buttonId}"`);
        }
        break;
      case 'location':
        messageData.latitude = message.location?.latitude;
        messageData.longitude = message.location?.longitude;
        break;
      case 'image':
        messageData.mediaId = message[message.type]?.id;
        messageData.mediaType = message.type;
        break;
    }

    // Handle initial greeting or restart
    if (messageData.body && (
      messageData.body.toLowerCase().includes('hi') || 
      messageData.body.toLowerCase().includes('hello') || 
      messageData.body.toLowerCase().includes('namaste')
    )) {
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      return sendLanguageSelection(phoneNumber);
    }

    // Route to appropriate handler based on state
    switch (session.state) {
      case 'language_selection':
        await handleLanguageSelection(session, phoneNumber, messageData.buttonId || messageData.body);
        break;
        
      case 'awaiting_location':
        await handleLocationInput(session, phoneNumber, messageData.latitude, messageData.longitude);
        break;
        
      case 'awaiting_image_choice':
        await handleImageChoice(session, phoneNumber, messageData.buttonId || messageData.body);
        break;
        
      case 'awaiting_image':
        await handleImageInput(session, phoneNumber, messageData.mediaId, messageData.mediaType);
        break;
        
      default:
        return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    await sendErrorMessage(message.from, 'english');
  }
}

// Send template message using Dialog360
async function sendTemplateMessage(to, templateName, languageCode = 'en', parameters = []) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    // Add parameters if provided
    if (parameters.length > 0) {
      payload.template.components = [{
        type: "body",
        parameters: parameters.map(param => ({
          type: "text",
          text: param
        }))
      }];
    }

    const response = await dialog360Client.post('/messages', payload);
    console.log('Template message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending template message:', error.response?.data || error.message);
    throw error;
  }
}

// Send interactive message (buttons/list)
async function sendInteractiveMessage(to, interactive) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "interactive",
      interactive: interactive
    };

    const response = await dialog360Client.post('/messages', payload);
    console.log('Interactive message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending interactive message:', error.response?.data || error.message);
    throw error;
  }
}

// Send language selection with interactive buttons
async function sendLanguageSelection(phoneNumber) {
  try {
    // First try with welcome template if available
    try {
      await sendTemplateMessage(phoneNumber, TEMPLATES.WELCOME_KANNADA, 'hi');
      console.log('Welcome template sent successfully');
    } catch (templateError) {
      console.log('Template failed, using interactive buttons:', templateError.message);
    }
    
    // Send interactive message with language choice buttons
    const interactive = {
      type: "button",
      body: {
        text: `🙏 ನಮಸ್ಕಾರ !\n\nWelcome to *Namma Bengaluru Pothole Reporter*! 🛣️\n\nHelp make our city's roads better by reporting potholes to BBMP.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:`
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "lang_english",
              title: "English"
            }
          },
          {
            type: "reply",
            reply: {
              id: "lang_kannada",
              title: "ಕನ್ನಡ"
            }
          }
        ]
      }
    };

    await sendInteractiveMessage(phoneNumber, interactive);
    console.log('Language selection buttons sent successfully');
  } catch (error) {
    console.error('Error sending language selection:', error);
    // Fallback to simple text message
    await sendTextMessage(phoneNumber, `🙏 Namaste \n\nWelcome to Namma Bengaluru Pothole Reporter! 🛣️\n\nHelp make our city's roads better by reporting potholes.\n\n1️⃣ English\n2️⃣ ಕನ್ನಡ (Kannada)\n\nType the number or language name`);
  }
}

// Handle language selection
async function handleLanguageSelection(session, phoneNumber, response) {
  try {
    console.log(`Language selection - Phone: ${phoneNumber}, Response: "${response}", Current state: ${session.state}`);
    
    let selectedLanguage = null;
    
    if (response) {
      if (response === 'lang_english' || response.toLowerCase().includes('english') || response === '1') {
        selectedLanguage = 'english';
      } else if (response === 'lang_kannada' || response.toLowerCase().includes('kannada') || response.toLowerCase().includes('ಕನ್ನಡ') || response === '2') {
        selectedLanguage = 'kannada';
      }
    }
    
    console.log(`Detected language: ${selectedLanguage}`);
    
    if (selectedLanguage) {
      // Check rate limiting before proceeding
      const canReport = await checkRateLimit(phoneNumber);
      
      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        const rateLimitMsg = selectedLanguage === 'kannada' 
          ? `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.\n\n🙏 ನಮ್ಮ ನಗರವನ್ನು ಸುಧಾರಿಸಲು ನಿಮ್ಮ ಉತ್ಸಾಹಕ್ಕೆ ಧನ್ಯವಾದಗಳು!\n\nನಮಸ್ಕಾರ! 🙏`
          : `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.\n\n🙏 Thank you for your enthusiasm in helping improve our city!\n\nNamaste! 🙏`;
        
        await sendTextMessage(phoneNumber, rateLimitMsg);
        return;
      }
      
      session.language = selectedLanguage;
      session.state = 'awaiting_location';
      await setSession(phoneNumber, session);
      return requestLocation(phoneNumber, selectedLanguage);
    } else {
      return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error('Error in handleLanguageSelection:', error);
    await sendErrorMessage(phoneNumber, 'english');
  }
}

// Request location using available templates
async function requestLocation(phoneNumber, language) {
  try {
    const templateName = language === 'kannada' ? TEMPLATES.LOCATION_REQUEST_KN : TEMPLATES.LOCATION_REQUEST_EN;
    const languageCode = language === 'kannada' ? 'kn' : 'en';
    
    await sendTemplateMessage(phoneNumber, templateName, languageCode);
  } catch (error) {
    console.error('Error requesting location:', error);
    // Fallback to hardcoded text message
    const locationMsg = language === 'kannada' 
      ? `🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗಂಡಿ ವರದಿ*\n\n📍 ದಯವಿಟ್ಟು ಗಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎/➕ ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 Location ಆಯ್ಕೆ ಮಾಡಿ\n🔹 Send your current location ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠️ ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ`
      : `🛣️ *Namma Bengaluru Pothole Report*\n\n📍 Please share the pothole location:\n\n🔹 Tap the 📎/➕ icon in WhatsApp\n🔹 Select Location\n🔹 Click Send your current location\n🔹 Move the marker to exact pothole spot\n\n⚠️ Only locations within Bengaluru city limits accepted\n\n🏛️ Your report will be sent to BBMP for action.`;
    
    await sendTextMessage(phoneNumber, locationMsg);
  }
}

// Handle location input
async function handleLocationInput(session, phoneNumber, latitude, longitude) {
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isWithinBangalore(lat, lng)) {
      const errorMsg = session.language === 'kannada' 
        ? '❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.'
        : '❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.';
      
      await sendTextMessage(phoneNumber, errorMsg);
      return;
    }
    
    // Check for duplicate potholes
    const duplicateCheck = await checkDuplicateLocation(lat, lng);
    
    if (duplicateCheck.isDuplicate) {
      const duplicateMsg = session.language === 'kannada'
        ? `⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ ಗಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ ಗಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 _BBMP ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`
        : `⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _BBMP is already working on this report_`;
      
      await sendTextMessage(phoneNumber, duplicateMsg);
      
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
    
    return requestImageChoice(phoneNumber, session.language);
  } else {
    return requestLocation(phoneNumber, session.language);
  }
}

// Request image choice using available templates
async function requestImageChoice(phoneNumber, language) {
  try {
    const templateName = language === 'kannada' ? TEMPLATES.IMAGE_CHOICE_KN : TEMPLATES.IMAGE_CHOICE_EN;
    const languageCode = language === 'kannada' ? 'kn' : 'en';
    
    await sendTemplateMessage(phoneNumber, templateName, languageCode);
  } catch (error) {
    console.error('Error sending image choice template:', error);
    // Fallback to interactive message with buttons
    const interactive = {
      type: "button",
      body: {
        text: language === 'kannada'
          ? `📸 ಗಂಡಿಯ ಫೋಟೋ\n\nದಯವಿಟ್ಟು ಗಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?\n\n💡 ಫೋಟೋ ಇರುವುದರಿಂದ ನಮಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ`
          : `📸 Pothole Photo\n\nWould you like to upload a photo of the pothole?\n\n💡 Photos help us assess the severity better`
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "upload_yes",
              title: language === 'kannada' ? "ಹೌದು ✅" : "Yes ✅"
            }
          },
          {
            type: "reply",
            reply: {
              id: "upload_no",
              title: language === 'kannada' ? "ಬೇಡ ❌" : "No ❌"
            }
          }
        ]
      }
    };

    await sendInteractiveMessage(phoneNumber, interactive);
  }
}

// Handle image choice
async function handleImageChoice(session, phoneNumber, response) {
  try {
    if (response === 'upload_yes' || response === '1' || response.toLowerCase().includes('yes') || response.toLowerCase().includes('ಹೌದು')) {
      session.state = 'awaiting_image';
      await setSession(phoneNumber, session);
      return requestImage(phoneNumber, session.language);
    } else if (response === 'upload_no' || response === '2' || response.toLowerCase().includes('no') || response.toLowerCase().includes('ಬೇಡ')) {
      // Skip image upload and save complaint without image
      return submitComplaintWithoutImage(session, phoneNumber);
    } else {
      return requestImageChoice(phoneNumber, session.language);
    }
  } catch (error) {
    console.error('Error in handleImageChoice:', error);
    await sendErrorMessage(phoneNumber, session.language);
  }
}

// Request image with hardcoded instructions
async function requestImage(phoneNumber, language) {
  try {
    const imageRequestMsg = language === 'kannada'
      ? `📸 *ಗಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n• ಗಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n• ಗಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`
      : `📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`;
    
    await sendTextMessage(phoneNumber, imageRequestMsg);
  } catch (error) {
    console.error('Error requesting image:', error);
    await sendErrorMessage(phoneNumber, language);
  }
}

// Handle image input with Dialog360 media
async function handleImageInput(session, phoneNumber, mediaId, mediaType) {
  if (mediaId && mediaType && mediaType === 'image') {
    try {
      // Generate complaint ID first
      const complaintId = uuidv4();
      
      // Upload and compress image to S3 using Dialog360 media endpoint
      const s3ImageUrl = await uploadMediaFromDialog360(mediaId, complaintId);
      
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
      
      // Send success message (hardcoded)
      const successMsg = session.language === 'kannada'
        ? `✅ *ಗಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`
        : `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`;
      
      await sendTextMessage(phoneNumber, successMsg);
      
    } catch (error) {
      console.error('Error saving complaint with image:', error);
      
      // Reset session state on error
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      
      await sendErrorMessage(phoneNumber, session.language);
    }
  } else {
    // Invalid file type
    const errorMsg = session.language === 'kannada'
      ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ'
      : 'Please send a valid image file';
    
    await sendTextMessage(phoneNumber, errorMsg);
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
    session.state = 'language_selection';
    await setSession(phoneNumber, session);
    
    // Send success message (hardcoded)
    const successMsg = session.language === 'kannada'
      ? `✅ *ಗಂಡಿ ವರದಿ ಸಫಲವಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`
      : `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ Your report has been sent to BBMP\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`;
    
    await sendTextMessage(phoneNumber, successMsg);
    
  } catch (error) {
    console.error('Error submitting complaint without image:', error);
    session.state = 'language_selection';
    await setSession(phoneNumber, session);
    await sendErrorMessage(phoneNumber, session.language);
  }
}

// Send error message (hardcoded)
async function sendErrorMessage(phoneNumber, language) {
  try {
    const errorMsg = language === 'kannada'
      ? '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಸಹಾಯ ಬೇಕೇ? ನಮ್ಮ ಸಿಸ್ಟಮ್ ಪ್ರತಿ ಹಂತದಲ್ಲೂ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.'
      : '❌ Technical error occurred.\n\n🔄 Please type "Hi" to try again\n\n💡 Need help? Our system is designed to guide you through each step.';
    
    await sendTextMessage(phoneNumber, errorMsg);
  } catch (error) {
    console.error('Error sending error message:', error);
    // Last resort: send plain text
    await sendTextMessage(phoneNumber, 'Something went wrong. Please try again.');
  }
}

// Send plain text message (fallback)
async function sendTextMessage(phoneNumber, text) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: {
        body: text
      }
    };

    const response = await dialog360Client.post('/messages', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Namma Pothole WhatsApp Bot (Dialog360) is running",
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

// Get all complaints endpoint
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
});

async function startServer() {
  await connectToMongoDB();
  await connectToRedis();
  app.listen(3000, () => {
    console.log("Dialog360 WhatsApp Bot Server is running on http://localhost:3000");
  });
}

startServer();
