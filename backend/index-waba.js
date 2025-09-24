import "dotenv/config";
import { putObject, uploadMediaFromWABA } from "./utils/s3Connection.js";
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
import { v4 as uuidv4 } from 'uuid';
import cors from "cors";
import axios from "axios";

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

// Middleware to parse URL-encoded data (for WABA webhooks)
app.use(express.urlencoded({ extended: false }));

// WABA Configuration
const WABA_BASE_URL = "https://login.wabaconnect.com/api";
const WABA_LICENSE_NUMBER = process.env.WABA_LICENSE_NUMBER;
const WABA_API_KEY = process.env.WABA_API_KEY;

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

// WABA Helper Functions
async function sendWABATextMessage(phoneNumber, message) {
  try {
    const url = `${WABA_BASE_URL}/sendtextmessage.php`;
    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber.replace(/^\+?91/, '')}`,
      Message: message
    };

    // console.log('📤 Sending WABA text message:', {
    //   to: params.Contact,
    //   message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    // });

    const response = await axios.get(url, { params });
    
    // console.log('✅ WABA text message response:', {
    //   status: response.status,
    //   data: response.data
    // });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WABA text message:', {
      error: error.message,
      phoneNumber,
      response: error.response?.data
    });
    throw error;
  }
}

async function sendWABAMediaMessage(phoneNumber, mediaUrl, caption = '') {
  try {
    const url = `${WABA_BASE_URL}/sendmediamessage.php`;
    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber.replace(/^\+?91/, '')}`,
      Type: 'image',
      FileURL: mediaUrl,
      Message: caption
    };

    // console.log('📤 Sending WABA media message:', {
    //   to: params.Contact,
    //   mediaUrl,
    //   caption: caption.substring(0, 50) + (caption.length > 50 ? '...' : '')
    // });

    const response = await axios.get(url, { params });
    
    // console.log('✅ WABA media message response:', {
    //   status: response.status,
    //   data: response.data
    // });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WABA media message:', {
      error: error.message,
      phoneNumber,
      response: error.response?.data
    });
    throw error;
  }
}

async function sendWABAButtonMessage(phoneNumber, message, buttons = []) {
  try {
    const url = `${WABA_BASE_URL}/sendmediamessage.php`;
    
    // Format buttons for WABA - each button as separate parameter
    const buttonText = buttons.length > 0 ? buttons.join(',') : '';
    
    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber.replace(/^\+?91/, '')}`,
      Message: message,
      Type: 'button',
      HeaderType: 'text',
      HeaderText: '',
      Button: buttonText
    };

    // console.log('📤 Sending WABA button message:', {
    //   to: params.Contact,
    //   message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    //   buttons: buttonText
    // });

    const response = await axios.get(url, { params });
    
    // console.log('✅ WABA button message response:', {
    //   status: response.status,
    //   data: response.data
    // });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WABA button message:', {
      error: error.message,
      phoneNumber,
      response: error.response?.data
    });
    throw error;
  }
}

// Main WhatsApp webhook endpoint for WABA
app.post("/whatsapp", async (req, res) => {
  try {
    // console.log('📥 WABA Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Parse WABA webhook structure based on actual format
    if (!req.body.entry || !req.body.entry[0] || !req.body.entry[0].changes || !req.body.entry[0].changes[0]) {
      console.log('⚠️ Invalid webhook structure');
      return res.status(200).json({ status: 'ignored', reason: 'invalid_structure' });
    }

    const value = req.body.entry[0].changes[0].value;
    
    if (!value.messages || !value.messages[0]) {
    //   console.log('⚠️ No message data in webhook');
      return res.status(200).json({ status: 'ignored', reason: 'no_message' });
    }

    const message = value.messages[0];
    // const contact = value.contacts && value.contacts[0];
    
    if (!message.from) {
      console.log('⚠️ No sender information in webhook');
      return res.status(200).json({ status: 'ignored', reason: 'no_sender' });
    }

    // Extract and process phone number from WABA webhook
    const phoneNumber = message.from.replace(/^\+?91/, '').replace(/\D/g, '');
    
    let session = await getSession(phoneNumber);
    if (!session) {
      session = { 
        language: null, 
        state: 'language_selection',
      };
      await setSession(phoneNumber, session);
    }

    // Extract message data based on type
    let messageData = {
      messageType: message.type,
    };

    switch (message.type) {
      case 'text':
        messageData.body = message.text?.body;
        messageData.buttonText = message.text?.body; // For button responses
        break;
        
      case 'location':
        messageData.latitude = message.location?.latitude;
        messageData.longitude = message.location?.longitude;
        break;
        
      case 'image':
        // Use the provided URL format for image download
        messageData.mediaUrl = `https://datads1.btpr.online/Whatsapp/${WABA_LICENSE_NUMBER}/${message.image?.id}.jpg`;
        messageData.mediaContentType = message.image?.mime_type;
        messageData.imageId = message.image?.id;
        break;
        
      case 'interactive':
        // Handle button replies from interactive messages
        if (message.interactive?.type === 'button_reply') {
          messageData.buttonText = message.interactive.button_reply?.title;
          messageData.body = message.interactive.button_reply?.title;
          messageData.buttonId = message.interactive.button_reply?.id;
        }
        break;
        
      case 'button':
        messageData.buttonText = message.button?.text;
        messageData.body = message.button?.text;
        break;
        
      default:
        console.log(`⚠️ Unsupported message type: ${message.type}`);
        return res.status(200).json({ status: 'ignored', reason: 'unsupported_type' });
    }

    res.status(200).json({ status: 'processed' });
    await handleWhatsAppMessage(session, phoneNumber, messageData);
    

  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Handle WhatsApp message flow
async function handleWhatsAppMessage(session, phoneNumber, messageData) {
  const { body, buttonText, latitude, longitude, mediaUrl, mediaContentType, messageType } = messageData;
  
  // Handle initial greeting or restart
  if (body && (body.toLowerCase().includes('hi') || body.toLowerCase().includes('hello') || body.toLowerCase().includes('namaste'))) {
    session.state = 'language_selection';
    await setSession(phoneNumber, session);
    return sendLanguageSelection(phoneNumber);
  }

  switch (session.state) {
    case 'language_selection':
      await handleLanguageSelection(session, phoneNumber, buttonText || body);
      break;
      
    case 'awaiting_location':
      await handleLocationInput(session, phoneNumber, latitude, longitude, messageType);
      break;
      
    case 'awaiting_image_choice':
      await handleImageChoice(session, phoneNumber, buttonText || body);
      break;
      
    case 'awaiting_image':
      await handleImageInput(session, phoneNumber, mediaUrl, mediaContentType);
      break;
      
    default:
      return sendLanguageSelection(phoneNumber);
  }
}

// Send language selection with improved messaging
async function sendLanguageSelection(phoneNumber) {
  try {
    const message = `🙏 ನಮಸ್ಕಾರ\n\nWelcome to Namma Pothole !\n\nHelp make our city's roads better by reporting potholes.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language`;
    
    const buttons = ['ಕನ್ನಡ', 'English'];
    
    await sendWABAButtonMessage(phoneNumber, message, buttons);
  } catch (error) {
    console.error('❌ Error sending language selection:', error);
  }
}

// Handle language selection - now goes directly to location request
async function handleLanguageSelection(session, phoneNumber, response) {
  try {
    let selectedLanguage = null;
    
    if (response) {
      const text = response.toLowerCase();
      if (text.includes('english')) {
        selectedLanguage = 'english';
      } else if (text.includes('ಕನ್ನಡ')) {
        selectedLanguage = 'kannada';
      }
    }
    
    if (selectedLanguage) {
      // Check rate limiting before proceeding
      const canReport = await checkRateLimit(phoneNumber);
      
      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        let message;
        
        if (selectedLanguage === 'kannada') {
          message = `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.`;
        } else {
          message = `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.`;
        }
        
        await sendWABATextMessage(phoneNumber, message);
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
    await sendWABATextMessage(phoneNumber, 'Sorry, something went wrong. Please type "Hi" to start again.');
  }
}

// Request location with improved Bangalore-centric messaging
async function requestLocation(phoneNumber, language) {
  let message;
  
  if (language === 'kannada') {
    message = `📍 ದಯವಿಟ್ಟು  ಗುಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎/➕ ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 Location ಆಯ್ಕೆ ಮಾಡಿ\n🔹 Send your current location ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹  ಗುಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠ ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ`;
  } else {
    message = `📍 Please share the pothole location:\n\n🔹 Tap the 📎/  ➕ icon in WhatsApp\n🔹 Select Location\n🔹 Click Send your current location\n🔹 Move the marker to exact pothole spot\n\n⚠ Only locations within Bengaluru city limits accepted`;
  }
  
  await sendWABAMediaMessage(phoneNumber, process.env.LOCATION_HELP_IMAGE_URL, message);
}

// Handle location input
async function handleLocationInput(session, phoneNumber, latitude, longitude, messageType) {
  if (messageType === 'location' && latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isWithinBangalore(lat, lng)) {
      let message;
      if (session.language === 'kannada') {
        message = '❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.';
      } else {
        message = '❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.';
      }
      await sendWABATextMessage(phoneNumber, message);
      return;
    }
    
    // Check for duplicate potholes
    const duplicateCheck = await checkDuplicateLocation(lat, lng);
    
    if (duplicateCheck.isDuplicate) {
      let message;
      if (session.language === 'kannada') {
        message = `⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ  ಗುಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ  ಗುಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 _ಅಧಿಕಾರಿಗಳು ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`;
      } else {
        message = `⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _Authorities are already working on this report_`;
      }
      
      await sendWABATextMessage(phoneNumber, message);
      
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

// Request image choice (Yes/No for uploading image)
async function requestImageChoice(phoneNumber, language) {
  try {
    let message;
    let buttons;
    
    if (language === 'kannada') {
      message = `📸 ಗುಂಡಿಯ ಫೋಟೋ\n\nದಯವಿಟ್ಟು ಗುಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?\n\n💡 ಫೋಟೋ ಇರುವುದರಿಂದ ನಮಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ`;
      buttons = ['ಹೌದು (ಶಿಫಾರಸು)', 'ಬೇಡ'];
    } else {
      message = `📸 Pothole Photo\n\nWould you like to upload a photo of the pothole?\n\n💡 Photos help us assess the severity better`;
      buttons = ['Yes (Recommended)', 'No'];
    }
    
    await sendWABAButtonMessage(phoneNumber, message, buttons);
  } catch (error) {
    console.error('❌ Error sending image choice buttons:', error);
  }
}

// Handle image choice
async function handleImageChoice(session, phoneNumber, response) {
  try {
    if (response.toLowerCase().includes('yes') || response.toLowerCase().includes('ಹೌದು')) {
      session.state = 'awaiting_image';
      await setSession(phoneNumber, session);
      return requestImage(phoneNumber, session.language);
    } else if (response.toLowerCase().includes('no') || response.toLowerCase().includes('ಬೇಡ')) {
      // Skip image upload and save complaint without image
      return submitComplaintWithoutImage(session, phoneNumber);
    } else {
      return requestImageChoice(phoneNumber, session.language);
    }
  } catch (error) {
    console.error('Error in handleImageChoice:', error);
    if (session.language === 'kannada') {
      await sendWABATextMessage(phoneNumber, 'ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } else {
      await sendWABATextMessage(phoneNumber, 'Something went wrong. Please type "Hi" to start again.');
    }
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
    
    let message;
    if (session.language === 'kannada') {
      message = `✅ * ಗುಂಡಿ ವರದಿ ಸಫಲವಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`;
    } else {
      message = `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ Your report has been sent to Authorities\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`;
    }
    
    await sendWABATextMessage(phoneNumber, message);
    
  } catch (error) {
    console.error('Error submitting complaint without image:', error);
    let message;
    if (session.language === 'kannada') {
      message = '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
    } else {
      message = '❌ Technical error occurred. Please type "Hi" to try again.';
    }
    await sendWABATextMessage(phoneNumber, message);
  }
}

// Request image with improved instructions
async function requestImage(phoneNumber, language) {
  let message;
  
  if (language === 'kannada') {
    message = `📸 * ಗುಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹  ಗುಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n•  ಗುಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n•  ಗುಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`;
  } else {
    message = `📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`;
  }
  
  await sendWABATextMessage(phoneNumber, message);
}

// Handle image input with compression and save complaint
async function handleImageInput(session, phoneNumber, mediaUrl, mediaContentType) {
  if (mediaUrl && mediaContentType && mediaContentType.startsWith('image/')) {
    try {
      // Send processing message first
      let processingMessage;
      if (session.language === 'kannada') {
        processingMessage = '⏳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ...';
      } else {
        processingMessage = '⏳ Uploading and compressing photo... Please wait...';
      }
      
      await sendWABATextMessage(phoneNumber, processingMessage);
      
      // Generate complaint ID first
      const complaintId = uuidv4();
      
      // Upload and compress image to S3
      const s3ImageUrl = await uploadMediaFromWABA(mediaUrl, complaintId);
      
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
      
      let message;
      if (session.language === 'kannada') {
        message = `✅ * ಗುಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\nನಿಮ್ಮ ದೂರನ್ನು nammapothole.com ನಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`;
      } else {
        message = `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to Authorities\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n You can view your complaint on our website: https://nammapothole.com\n\n🔄 Type "Hi" to submit another report`;
      }
      
      await sendWABATextMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('Error saving complaint with image:', error);
      
      // Reset session state on error
      session.state = 'language_selection';
      await setSession(phoneNumber, session);
      
      let message;
      if (session.language === 'kannada') {
        message = '❌ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಫೋಟೋ ಇಲ್ಲದೇ ವರದಿ ಮಾಡಲೂ ಬಹುದು';
      } else {
        message = '❌ Error uploading photo. \n\n🔄 Please type "Hi" to try again\n\n💡 You can also report without photo';
      }
      await sendWABATextMessage(phoneNumber, message);
    }
  } else {
    // Invalid file type
    let message;
    if (session.language === 'kannada') {
      message = '❌ ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ\n\n📸 ಮಾನ್ಯ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: JPG, PNG, WEBP';
    } else {
      message = '❌ Please send a valid image file\n\n📸 Supported formats: JPG, PNG, WEBP';
    }
    await sendWABATextMessage(phoneNumber, message);
  }
}

/*
 * PRODUCTION WABA TEMPLATES
 * 
 * For production deployment with approved WABA number,
 * implement proper message templates with interactive buttons:
 * 
 * 1. Language Selection Template:
 *    - Button type with quick reply buttons: "English" | "ಕನ್ನಡ"
 * 
 * 2. Image Choice Template:
 *    - Button type with quick reply buttons: "Yes, Upload Photo" | "No, Skip Photo"
 * 
 * 3. List Templates:
 *    - List type for multiple choice options
 * 
 * Use WABA button and list message formats from documentation
 */

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Namma Pothole WABA Bot is running",
    timestamp: new Date().toISOString(),
    service: "waba"
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

// Complaints endpoint (same as original)
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
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 WABA Pothole Bot Server running on http://localhost:${port}`);
    console.log(`📱 WABA License: ${WABA_LICENSE_NUMBER ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`🔑 WABA API Key: ${WABA_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  });
}

startServer();
