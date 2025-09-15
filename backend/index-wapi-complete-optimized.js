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
import { Agent } from 'https';

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
app.use(express.urlencoded({ extended: false }));

// WAPI Configuration - OPTIMIZED
const WAPI_BASE_URL = "https://wapi.in.net/api";
const WAPI_VENDOR_UID = process.env.WAPI_VENDOR_UID;
const WAPI_BEARER_TOKEN = process.env.WAPI_BEARER_TOKEN;
const WAPI_PHONE_NUMBER_ID = process.env.WAPI_PHONE_NUMBER_ID;

// PERFORMANCE OPTIMIZATION: HTTP Agent with connection pooling
const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 20,
  timeout: 3000,
  freeSocketTimeout: 30000,
});

// Configure axios for WAPI - PERFORMANCE OPTIMIZED
const wapiClient = axios.create({
  baseURL: WAPI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${WAPI_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  },
  timeout: 6000, // Reduced timeout
  maxRedirects: 1, // Limit redirects
  httpsAgent: httpsAgent,
  // Additional performance settings
  maxContentLength: 50000,
  maxBodyLength: 50000,
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// OPTIMIZATION: Request interceptor for timing
wapiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// OPTIMIZATION: Response interceptor for logging
wapiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    if (duration > 2000) {
      console.warn(`Slow WAPI request: ${duration}ms to ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const duration = Date.now() - error.config?.metadata?.startTime;
    console.error(`WAPI request failed after ${duration}ms:`, error.message);
    return Promise.reject(error);
  }
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

// State constants
const STATES = {
  LANGUAGE_SELECTION: 'language_selection',
  AWAITING_LOCATION: 'awaiting_location',
  AWAITING_IMAGE_CHOICE: 'awaiting_image_choice',
  AWAITING_IMAGE: 'awaiting_image'
};

// OPTIMIZATION: Message queue with priority
const messageQueue = [];
const priorityQueue = []; // For urgent messages
let isProcessingQueue = false;

// OPTIMIZATION: Batch process messages with priority handling
setInterval(async () => {
  if ((messageQueue.length > 0 || priorityQueue.length > 0) && !isProcessingQueue) {
    isProcessingQueue = true;
    
    // Process priority messages first
    const priorityBatch = priorityQueue.splice(0, 3);
    const regularBatch = messageQueue.splice(0, 2);
    const batch = [...priorityBatch, ...regularBatch];
    
    if (batch.length > 0) {
      try {
        // Process in parallel with error handling
        await Promise.allSettled(batch.map(async (item) => {
          try {
            await sendWAPIMessageDirect(item.phoneNumber, item.messageBody, item.isMedia, item.mediaUrl, item.mediaType);
          } catch (error) {
            console.error(`Failed to send message to ${item.phoneNumber}:`, error.message);
            // Retry logic for failed messages
            if (item.retries < 2) {
              item.retries = (item.retries || 0) + 1;
              messageQueue.push(item);
            }
          }
        }));
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }
    
    isProcessingQueue = false;
  }
}, 75); // Faster processing - every 75ms

// OPTIMIZATION: Session cache to reduce Redis calls
const sessionCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// OPTIMIZATION: Webhook deduplication
const processedWebhooks = new Set();
setInterval(() => {
  processedWebhooks.clear();
}, 60000); // Clear every minute

// Main WhatsApp webhook endpoint for WAPI - HEAVILY OPTIMIZED
app.post("/whatsapp", async (req, res) => {
  // CRITICAL OPTIMIZATION: Respond immediately to webhook
  res.status(200).send('OK');
  
  try {
    // OPTIMIZATION: Skip processing for status updates and duplicates
    const webhookId = req.body.message?.whatsapp_message_id;
    if (!webhookId || processedWebhooks.has(webhookId)) {
      return;
    }
    
    // OPTIMIZATION: Filter out status messages early
    if (!req.body.message?.is_new_message) {
      return;
    }
    
    processedWebhooks.add(webhookId);
    
    console.log('Processing webhook:', webhookId);
    
    // Process incoming messages from WAPI webhook
    if (req.body.contact && req.body.message && req.body.message.is_new_message) {
      const contact = req.body.contact;
      const message = req.body.message;
      const whatsappPayload = req.body.whatsapp_webhook_payload;
      
      // OPTIMIZATION: Process asynchronously after webhook response
      setImmediate(() => handleWAPIMessage(contact, message, whatsappPayload));
    }
  } catch (error) {
    console.error('WAPI webhook error:', error);
  }
});

// OPTIMIZATION: Get session with caching
async function getCachedSession(phoneNumber) {
  const cacheKey = `session_${phoneNumber}`;
  const cached = sessionCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const session = await getSession(phoneNumber);
  if (session) {
    sessionCache.set(cacheKey, {
      data: session,
      timestamp: Date.now()
    });
  }
  
  return session;
}

// OPTIMIZATION: Set session with cache update
async function setCachedSession(phoneNumber, session) {
  const cacheKey = `session_${phoneNumber}`;
  sessionCache.set(cacheKey, {
    data: session,
    timestamp: Date.now()
  });
  await setSession(phoneNumber, session);
}

// Handle incoming WhatsApp message via WAPI - OPTIMIZED
async function handleWAPIMessage(contact, message, whatsappPayload) {
  const phoneNumber = contact.phone_number;
  
  try {
    console.log(`Processing message from ${phoneNumber}`);
    
    // OPTIMIZATION: Parallel session and message parsing
    const [session, messageData] = await Promise.all([
      getOrCreateSession(phoneNumber),
      parseMessageData(message, whatsappPayload)
    ]);

    // Handle initial greeting or restart
    if (messageData.body && (
      messageData.body.toLowerCase().includes('hi') || 
      messageData.body.toLowerCase().includes('hello') || 
      messageData.body.toLowerCase().includes('namaste')
    )) {
      session.state = STATES.LANGUAGE_SELECTION;
      await setCachedSession(phoneNumber, session);
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

// OPTIMIZATION: Get or create session efficiently
async function getOrCreateSession(phoneNumber) {
  let session = await getCachedSession(phoneNumber);
  if (!session) {
    session = { 
      language: null, 
      state: STATES.LANGUAGE_SELECTION
    };
    await setCachedSession(phoneNumber, session);
  }
  return session;
}

// OPTIMIZATION: Parse message data efficiently
function parseMessageData(message, whatsappPayload) {
  const messageData = {
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

  return messageData;
}

// OPTIMIZATION: Queue messages with priority
function sendWAPIMessage(phoneNumber, messageBody, isPriority = false) {
  const messageItem = { 
    phoneNumber, 
    messageBody, 
    isMedia: false,
    retries: 0
  };
  
  if (isPriority) {
    priorityQueue.push(messageItem);
  } else {
    messageQueue.push(messageItem);
  }
  
  return Promise.resolve(); // Non-blocking
}

// OPTIMIZATION: Queue media messages
function sendMediaMessage(phoneNumber, messageBody, mediaUrl, mediaType = 'image', caption = null) {
  const messageItem = {
    phoneNumber,
    messageBody: caption || messageBody,
    isMedia: true,
    mediaUrl,
    mediaType,
    retries: 0
  };
  
  priorityQueue.push(messageItem); // Media messages get priority
  return Promise.resolve(); // Non-blocking
}

// Direct message sending (for batch processing)
async function sendWAPIMessageDirect(phoneNumber, messageBody, isMedia = false, mediaUrl = null, mediaType = 'image') {
  try {
    let payload, endpoint;
    
    if (isMedia && mediaUrl) {
      payload = {
        from_phone_number_id: WAPI_PHONE_NUMBER_ID,
        phone_number: phoneNumber,
        media_type: mediaType,
        media_url: mediaUrl,
        caption: messageBody
      };
      endpoint = `/${WAPI_VENDOR_UID}/contact/send-media-message`;
    } else {
      payload = {
        from_phone_number_id: WAPI_PHONE_NUMBER_ID,
        phone_number: phoneNumber,
        message_body: messageBody
      };
      endpoint = `/${WAPI_VENDOR_UID}/contact/send-message`;
    }

    const response = await wapiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending WAPI message:', error.response?.data || error.message);
    throw error;
  }
}

// Send language selection
function sendLanguageSelection(phoneNumber) {
  return sendWAPIMessage(phoneNumber, `🙏 ನಮಸ್ಕಾರ!\n\nWelcome to *Namma Pothole Bengaluru*!\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:\n\n1️⃣ English\n2️⃣ ಕನ್ನಡ (Kannada)\n\n_Type the number or language name_`, true);
}

// Handle language selection - OPTIMIZED
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
      // OPTIMIZATION: Parallel operations
      const [canReport] = await Promise.all([
        checkRateLimit(phoneNumber),
        setSessionState(phoneNumber, session, STATES.AWAITING_LOCATION, selectedLanguage)
      ]);
      
      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        
        if (selectedLanguage === 'kannada') {
          return sendWAPIMessage(phoneNumber, `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.\n\nನಮಸ್ಕಾರ! 🙏`, true);
        } else {
          return sendWAPIMessage(phoneNumber, `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.\n\nNamaste! 🙏`, true);
        }
      }
      
      return requestLocation(phoneNumber, selectedLanguage);
    } else {
      return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error('Error in handleLanguageSelection:', error);
    return sendWAPIMessage(phoneNumber, 'Sorry, something went wrong. Please type "Hi" to start again.');
  }
}

// OPTIMIZATION: Combine session updates
async function setSessionState(phoneNumber, session, state, language = null) {
  session.state = state;
  if (language) session.language = language;
  await setCachedSession(phoneNumber, session);
}

// Request location using media message with helper image
async function requestLocation(phoneNumber, language) {
  const imageUrl = process.env.LOCATION_HELP_IMAGE_URL;
  
  if (language === 'kannada') {
    return sendMediaMessage(
      phoneNumber,
      `🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗುಂಡಿ ವರದಿ*\n\n📍 ದಯವಿಟ್ಟು ಗುಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Location* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 *Send your current location* ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹 ಗುಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠️ _ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ_`,
      imageUrl,
      'image'
    );
  } else {
    return sendMediaMessage(
      phoneNumber,
      `🛣️ *Namma Pothole Bengaluru*\n\n📍 Please share the pothole location:\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Location*\n🔹 Click *Send your current location*\n🔹 Move the marker to exact pothole spot\n\n⚠️ _Only locations within Bengaluru city limits accepted_\n\n🏛️ Your report will be sent to Authorities for action.`,
      imageUrl,
      'image'
    );
  }
}

// Handle location input - OPTIMIZED
async function handleLocationInput(session, phoneNumber, latitude, longitude) {
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isWithinBangalore(lat, lng)) {
      if (session.language === 'kannada') {
        return sendWAPIMessage(phoneNumber, '❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.');
      } else {
        return sendWAPIMessage(phoneNumber, '❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.');
      }
    }
    
    // OPTIMIZATION: Parallel duplicate check and session update
    const [duplicateCheck] = await Promise.all([
      checkDuplicateLocation(lat, lng),
      setSessionLocation(phoneNumber, session, lat, lng)
    ]);
    
    if (duplicateCheck.isDuplicate) {
      if (session.language === 'kannada') {
        await sendWAPIMessage(phoneNumber, `⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ ಗುಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ ಗುಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 ಅಧಿಕಾರಿಗಳು ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`);
      } else {
        await sendWAPIMessage(phoneNumber, `⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _Authorities are already working on this report_`);
      }
      
      // Reset to language selection for new report
      session.state = STATES.LANGUAGE_SELECTION;
      await setCachedSession(phoneNumber, session);
      return;
    }
    
    return requestImageChoice(phoneNumber, session.language);
  } else {
    return requestLocation(phoneNumber, session.language);
  }
}

// OPTIMIZATION: Set session location
async function setSessionLocation(phoneNumber, session, lat, lng) {
  session.latitude = lat;
  session.longitude = lng;
  session.state = STATES.AWAITING_IMAGE_CHOICE;
  await setCachedSession(phoneNumber, session);
}

// Request image choice using normal text message
async function requestImageChoice(phoneNumber, language) {
  if (language === 'kannada') {
    return sendWAPIMessage(phoneNumber, `📸 *ಗುಂಡಿಯ ಫೋಟೋ*\n\nದಯವಿಟ್ಟು ಗುಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?\n\n✅ *1 - ಹೌದು* (ಶಿಫಾರಸು)\n❌ *2 - ಬೇಡ*\n\n💡 _ಫೋಟೋ ಇರುವುದರಿಂದ ಅಧಿಕಾರಿಗಳು ಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ_\n\n_Type 1 or 2_`);
  } else {
    return sendWAPIMessage(phoneNumber, `📸 *Pothole Photo*\n\nWould you like to upload a photo of the pothole?\n\n✅ *1 - Yes* (Recommended)\n❌ *2 - No*\n\n💡 _Photos help Authorities assess the severity better_\n\n_Type 1 or 2_`);
  }
}

// Handle image choice
async function handleImageChoice(session, phoneNumber, response) {
  try {
    if (response === '1' || response?.toLowerCase().includes('yes') || response?.toLowerCase().includes('ಹೌದು')) {
      session.state = STATES.AWAITING_IMAGE;
      await setCachedSession(phoneNumber, session);
      return requestImage(phoneNumber, session.language);
    } else if (response === '2' || response?.toLowerCase().includes('no') || response?.toLowerCase().includes('ಬೇಡ')) {
      // Skip image upload and save complaint without image
      return submitComplaintWithoutImage(session, phoneNumber);
    } else {
      return requestImageChoice(phoneNumber, session.language);
    }
  } catch (error) {
    console.error('Error in handleImageChoice:', error);
    return sendWAPIMessage(phoneNumber, 'Something went wrong. Please type "Hi" to start again.');
  }
}

// Request image with normal text message
async function requestImage(phoneNumber, language) {
  if (language === 'kannada') {
    return sendWAPIMessage(phoneNumber, `📸 *ಗುಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 ಗುಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n• ಗುಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n• ಗುಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`);
  } else {
    return sendWAPIMessage(phoneNumber, `📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`);
  }
}

// Submit complaint without image - OPTIMIZED
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
    
    // OPTIMIZATION: Parallel complaint creation and session reset
    const [complaint] = await Promise.all([
      newComplaint(complaintData),
      resetSessionToLanguageSelection(phoneNumber, session)
    ]);
    
    if (session.language === 'kannada') {
      return sendWAPIMessage(phoneNumber, `✅ *ಗುಂಡಿ ವರದಿ ಸಫಲವಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಧಿಕಾರಿಗಳು ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`, true);
    } else {
      return sendWAPIMessage(phoneNumber, `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n\n🏛️ Your report has been sent to Authorities\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`, true);
    }
    
  } catch (error) {
    console.error('Error submitting complaint without image:', error);
    if (session.language === 'kannada') {
      return sendWAPIMessage(phoneNumber, '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } else {
      return sendWAPIMessage(phoneNumber, '❌ Technical error occurred. Please type "Hi" to try again.');
    }
  }
}

// Handle image input with compression and save complaint - OPTIMIZED
async function handleImageInput(session, phoneNumber, mediaUrl, mediaType) {
  if (mediaUrl && mediaType === 'image') {
    try {
      // Send processing message first (priority)
      if (session.language === 'kannada') {
        sendWAPIMessage(phoneNumber, '⏳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ...', true);
      } else {
        sendWAPIMessage(phoneNumber, '⏳ Uploading and compressing photo... Please wait...', true);
      }
      
      // Generate complaint ID first
      const complaintId = uuidv4();
      
      // OPTIMIZATION: Parallel image upload and session reset
      const [s3ImageUrl] = await Promise.all([
        uploadMediaFromWAPI(mediaUrl, complaintId),
        resetSessionToLanguageSelection(phoneNumber, session)
      ]);
      
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
      
      if (session.language === 'kannada') {
        return sendWAPIMessage(phoneNumber, `✅ *ಗುಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${complaint.complaintId}\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಧಿಕಾರಿಗಳು ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`, true);
      } else {
        return sendWAPIMessage(phoneNumber, `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${complaint.complaintId}\`\n📍 Location: ${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to Authorities\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n🔄 Type "Hi" to submit another report`, true);
      }
      
    } catch (error) {
      console.error('Error saving complaint with image:', error);
      
      // Reset session state on error
      await resetSessionToLanguageSelection(phoneNumber, session);
      
      if (session.language === 'kannada') {
        return sendWAPIMessage(phoneNumber, '❌ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಫೋಟೋ ಇಲ್ಲದೇ ವರದಿ ಮಾಡಲೂ ಬಹುದು');
      } else {
        return sendWAPIMessage(phoneNumber, '❌ Error uploading photo. \n\n🔄 Please type "Hi" to try again\n\n💡 You can also report without photo');
      }
    }
  } else {
    // Invalid file type
    if (session.language === 'kannada') {
      return sendWAPIMessage(phoneNumber, '❌ ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ\n\n📸 ಮಾನ್ಯ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: JPG, PNG, WEBP');
    } else {
      return sendWAPIMessage(phoneNumber, '❌ Please send a valid image file\n\n📸 Supported formats: JPG, PNG, WEBP');
    }
  }
}

// OPTIMIZATION: Reset session helper
async function resetSessionToLanguageSelection(phoneNumber, session) {
  session.state = STATES.LANGUAGE_SELECTION;
  await setCachedSession(phoneNumber, session);
}

// Send error message
async function sendErrorMessage(phoneNumber, language) {
  if (language === 'kannada') {
    return sendWAPIMessage(phoneNumber, '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
  } else {
    return sendWAPIMessage(phoneNumber, '❌ Technical error occurred. Please type "Hi" to try again.');
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Namma Pothole WhatsApp Bot is running",
    timestamp: new Date().toISOString(),
    performance: {
      queueSize: messageQueue.length,
      priorityQueueSize: priorityQueue.length,
      cacheSize: sessionCache.size
    }
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
    console.log("Performance optimizations enabled:");
    console.log("- Message queuing with priority");
    console.log("- Session caching");
    console.log("- Connection pooling");
    console.log("- Webhook deduplication");
  });
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

// OPTIMIZATION: Graceful shutdown with queue cleanup
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  
  // Process remaining messages
  if (messageQueue.length > 0 || priorityQueue.length > 0) {
    console.log(`Processing ${messageQueue.length + priorityQueue.length} remaining messages...`);
    // Give it 5 seconds to process remaining messages
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  process.exit(0);
});

startServer();
