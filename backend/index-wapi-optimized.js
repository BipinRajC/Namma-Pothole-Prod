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

// WAPI Configuration - OPTIMIZED
const WAPI_BASE_URL = "https://wapi.in.net/api";
const WAPI_VENDOR_UID = process.env.WAPI_VENDOR_UID || "7634c63c-352a-4e2c-a7f4-69c2e0197d5c";
const WAPI_BEARER_TOKEN = process.env.WAPI_BEARER_TOKEN;
const WAPI_PHONE_NUMBER_ID = process.env.WAPI_PHONE_NUMBER_ID || "846178335235016";

// Configure axios for WAPI - PERFORMANCE OPTIMIZED
const wapiClient = axios.create({
  baseURL: WAPI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${WAPI_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
    'Connection': 'keep-alive', // Reuse connections
  },
  timeout: 5000, // Reduced from 10000ms to 5000ms
  maxRedirects: 2, // Limit redirects
  keepAlive: true, // Enable keep-alive
});

// HTTP Agent for connection pooling (Node.js optimization)
import { Agent } from 'https';
const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 20,
  maxFreeSockets: 10,
  timeout: 5000,
});
wapiClient.defaults.httpsAgent = httpsAgent;

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

// Message queue for batching (OPTIMIZATION)
const messageQueue = [];
let isProcessingQueue = false;

// OPTIMIZATION: Batch process messages every 100ms
setInterval(async () => {
  if (messageQueue.length > 0 && !isProcessingQueue) {
    isProcessingQueue = true;
    const batch = messageQueue.splice(0, 5); // Process 5 messages at once
    
    try {
      await Promise.all(batch.map(async (item) => {
        await sendWAPIMessageDirect(item.phoneNumber, item.messageBody);
      }));
    } catch (error) {
      console.error('Batch processing error:', error);
    }
    
    isProcessingQueue = false;
  }
}, 100);

// Main WhatsApp webhook endpoint for WAPI - OPTIMIZED
app.post("/whatsapp", async (req, res) => {
  // OPTIMIZATION: Respond immediately to webhook
  res.status(200).send('OK');
  
  try {
    console.log('Received WAPI webhook:', JSON.stringify(req.body, null, 2));
    
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

// Handle incoming WhatsApp message via WAPI - OPTIMIZED
async function handleWAPIMessage(contact, message, whatsappPayload) {
  try {
    const phoneNumber = contact.phone_number;
    
    console.log(`Processing message from ${phoneNumber}:`, message);
    
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
      await setSession(phoneNumber, session);
      return sendLanguageSelectionOptimized(phoneNumber);
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
        return sendLanguageSelectionOptimized(phoneNumber);
    }
  } catch (error) {
    console.error('Error handling WAPI message:', error);
    await sendErrorMessageOptimized(phoneNumber, 'english');
  }
}

// OPTIMIZATION: Get or create session in one operation
async function getOrCreateSession(phoneNumber) {
  let session = await getSession(phoneNumber);
  if (!session) {
    session = { 
      language: null, 
      state: STATES.LANGUAGE_SELECTION
    };
    await setSession(phoneNumber, session);
  }
  return session;
}

// OPTIMIZATION: Parse message data efficiently
async function parseMessageData(message, whatsappPayload) {
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

// OPTIMIZATION: Queue messages instead of immediate sending
function sendWAPIMessage(phoneNumber, messageBody) {
  messageQueue.push({ phoneNumber, messageBody });
  return Promise.resolve(); // Non-blocking
}

// Direct message sending (for urgent messages)
async function sendWAPIMessageDirect(phoneNumber, messageBody) {
  try {
    const payload = {
      from_phone_number_id: WAPI_PHONE_NUMBER_ID,
      phone_number: phoneNumber,
      message_body: messageBody
    };

    const response = await wapiClient.post(`/${WAPI_VENDOR_UID}/contact/send-message`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending WAPI message:', error.response?.data || error.message);
    throw error;
  }
}

// OPTIMIZATION: Send media message with connection reuse
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
    return response.data;
  } catch (error) {
    console.error('Error sending media message:', error.response?.data || error.message);
    throw error;
  }
}

// OPTIMIZATION: Language selection with reduced logging
function sendLanguageSelectionOptimized(phoneNumber) {
  return sendWAPIMessage(phoneNumber, `🙏 ನಮಸ್ಕಾರ!\n\nWelcome to *Namma Bengaluru Pothole Reporter*! 🛣️\n\nHelp make our city's roads better by reporting potholes to BBMP.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:\n\n1️⃣ English\n2️⃣ ಕನ್ನಡ (Kannada)\n\n_Type the number or language name_`);
}

// OPTIMIZATION: Error handling with queued messages
function sendErrorMessageOptimized(phoneNumber, language) {
  if (language === 'kannada') {
    return sendWAPIMessage(phoneNumber, '❌ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
  } else {
    return sendWAPIMessage(phoneNumber, '❌ Technical error occurred. Please type "Hi" to try again.');
  }
}

// [Rest of the handlers remain the same but use optimized message sending]
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
      // OPTIMIZATION: Parallel rate limit check and session update
      const [canReport] = await Promise.all([
        checkRateLimit(phoneNumber),
        setSessionState(phoneNumber, session, STATES.AWAITING_LOCATION, selectedLanguage)
      ]);
      
      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        
        if (selectedLanguage === 'kannada') {
          return sendWAPIMessage(phoneNumber, `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.\n\nನಮಸ್ಕಾರ! 🙏`);
        } else {
          return sendWAPIMessage(phoneNumber, `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.\n\nNamaste! 🙏`);
        }
      }
      
      return requestLocation(phoneNumber, selectedLanguage);
    } else {
      return sendLanguageSelectionOptimized(phoneNumber);
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
  await setSession(phoneNumber, session);
}

// Request location using media message with helper image
async function requestLocation(phoneNumber, language) {
  const imageUrl = process.env.LOCATION_HELP_IMAGE_URL;
  
  if (language === 'kannada') {
    return sendMediaMessage(
      phoneNumber,
      `🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗಂಡಿ ವರದಿ*\n\n📍 ದಯವಿಟ್ಟು ಗಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Location* ಆಯ್ಕೆ ಮಾಡಿ\n🔹 *Send your current location* ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹 ಗಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠️ _ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ_`,
      imageUrl,
      'image'
    );
  } else {
    return sendMediaMessage(
      phoneNumber,
      `🛣️ *Namma Bengaluru Pothole Report*\n\n📍 Please share the pothole location:\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Location*\n🔹 Click *Send your current location*\n🔹 Move the marker to exact pothole spot\n\n⚠️ _Only locations within Bengaluru city limits accepted_\n\n🏛️ Your report will be sent to BBMP for action.`,
      imageUrl,
      'image'
    );
  }
}

// [Include remaining handler functions with similar optimizations...]

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
