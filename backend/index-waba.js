import "dotenv/config";
import { connectToMongoDB } from "./utils/mongoUtils.js";
import { connectToRedis, setSession, getSession } from "./utils/redisUtils.js";
import express from "express";
import cors from "cors";
import { WABA_LICENSE_NUMBER, WABA_API_KEY } from "./utils/constants.js";
import { handleWhatsAppMessage } from "./whatsappUtils/initialState.js";
import complaintsRouter from "./routes/complaintsRoutes.js";

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

// Main WhatsApp webhook endpoint for WABA
app.post("/whatsapp", async (req, res) => {
  try {
    // console.log('📥 WABA Webhook received:', JSON.stringify(req.body, null, 2));

    // Parse WABA webhook structure based on actual format
    if (
      !req.body.entry ||
      !req.body.entry[0] ||
      !req.body.entry[0].changes ||
      !req.body.entry[0].changes[0]
    ) {
      console.log("⚠️ Invalid webhook structure");
      return res
        .status(200)
        .json({ status: "ignored", reason: "invalid_structure" });
    }

    const value = req.body.entry[0].changes[0].value;

    if (!value.messages || !value.messages[0]) {
      //   console.log('⚠️ No message data in webhook');
      return res.status(200).json({ status: "ignored", reason: "no_message" });
    }

    const message = value.messages[0];
    // const contact = value.contacts && value.contacts[0];

    if (!message.from) {
      console.log("⚠️ No sender information in webhook");
      return res.status(200).json({ status: "ignored", reason: "no_sender" });
    }

    // Extract and process phone number from WABA webhook
    const phoneNumber = message.from.replace(/^\+?91/, "").replace(/\D/g, "");

    let session = await getSession(phoneNumber);
    if (!session) {
      session = {
        language: null,
        state: "language_selection",
      };
      await setSession(phoneNumber, session);
    }

    // Extract message data based on type
    let messageData = {
      messageType: message.type,
    };

    switch (message.type) {
      case "text":
        messageData.body = message.text?.body;
        messageData.buttonText = message.text?.body; // For button responses
        break;

      case "location":
        messageData.latitude = message.location?.latitude;
        messageData.longitude = message.location?.longitude;
        break;

      case "image":
        // Use the provided URL format for image download
        messageData.mediaUrl = `https://datads1.btpr.online/Whatsapp/${WABA_LICENSE_NUMBER}/${message.image?.id}.jpg`;
        messageData.mediaContentType = message.image?.mime_type;
        messageData.imageId = message.image?.id;
        break;

      case "interactive":
        // Handle button replies from interactive messages
        if (message.interactive?.type === "button_reply") {
          messageData.buttonText = message.interactive.button_reply?.title;
          messageData.body = message.interactive.button_reply?.title;
          messageData.buttonId = message.interactive.button_reply?.id;
        }
        break;

      case "button":
        messageData.buttonText = message.button?.text;
        messageData.body = message.button?.text;
        break;

      default:
        console.log(`⚠️ Unsupported message type: ${message.type}`);
        return res
          .status(200)
          .json({ status: "ignored", reason: "unsupported_type" });
    }

    res.status(200).json({ status: "processed" });
    await handleWhatsAppMessage(session, phoneNumber, messageData);
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Namma Pothole WABA Bot is running",
    timestamp: new Date().toISOString(),
    service: "waba",
  });
});

// Complaints endpoint
app.use("/complaints", complaintsRouter);

async function startServer() {
  await connectToMongoDB();
  await connectToRedis();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(
      `🚀 WABA Pothole Bot Server running on http://localhost:${port}`
    );
    console.log(
      `📱 WABA License: ${
        WABA_LICENSE_NUMBER ? "Configured" : "NOT CONFIGURED"
      }`
    );
    console.log(
      `🔑 WABA API Key: ${WABA_API_KEY ? "Configured" : "NOT CONFIGURED"}`
    );
  });
}

startServer();
