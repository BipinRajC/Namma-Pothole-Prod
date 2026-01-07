import { setSession } from "../utils/redisUtils.js";
import {
  sendWABATextMessage,
  sendWABAMediaMessage,
} from "../utils/wabaHelperFns.js";
import { checkDuplicateLocation } from "../utils/mongoUtils.js";
import { requestImage } from "./imageState.js";
import { isWithinBangalore } from "../utils/geoUtils.js";

// Request location with improved Bangalore-centric messaging
async function requestLocation(phoneNumber, language) {
  let message;

  if (language === "kannada") {
    message = `📍 ದಯವಿಟ್ಟು  ಗುಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:\n\n🔹 WhatsApp ನಲ್ಲಿ 📎/➕ ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 Location ಆಯ್ಕೆ ಮಾಡಿ\n🔹 Send your current location ಕ್ಲಿಕ್ ಮಾಡಿ\n🔹  ಗುಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ\n\n⚠ ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ`;
  } else {
    message = `📍 Please share the pothole location:\n\n🔹 Tap the 📎/  ➕ icon in WhatsApp\n🔹 Select Location\n🔹 Click Send your current location\n🔹 Move the marker to exact pothole spot\n\n⚠ Only locations within Bengaluru city limits accepted`;
  }

  await sendWABAMediaMessage(
    phoneNumber,
    process.env.LOCATION_HELP_IMAGE_URL,
    message
  );
}

// Handle location input
async function handleLocationInput(
  session,
  phoneNumber,
  latitude,
  longitude,
  messageType
) {
  if (messageType === "location" && latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isWithinBangalore(lat, lng)) {
      let message;
      if (session.language === "kannada") {
        message =
          "❌ ಈ ಸ್ಥಳ ಬೆಂಗಳೂರಿನ ಹೊರಗಿದೆ\n\nದಯವಿಟ್ಟು ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.";
      } else {
        message =
          "❌ This location is outside Bangalore\n\nPlease share a location within Bangalore city limits.";
      }
      await sendWABATextMessage(phoneNumber, message);
      return;
    }

    // Check for duplicate potholes
    const duplicateCheck = await checkDuplicateLocation(lat, lng);

    if (duplicateCheck.isDuplicate) {
      let message;
      if (session.language === "kannada") {
        message = `⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*\n\nಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ  ಗುಂಡಿ ವರದಿಯಾಗಿದೆ!\n\n📍 ದೂರ: ${duplicateCheck.distance} ಮೀಟರ್\n🆔 ಅಸ್ತಿತ್ವದ ದೂರು: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 ಬೇರೆ  ಗುಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ\n\n🙏 _ಅಧಿಕಾರಿಗಳು ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_`;
      } else {
        message = `⚠️ *Duplicate Report Detected*\n\nPothole already reported at this location!\n\n📍 Distance: ${duplicateCheck.distance}m away\n🆔 Existing complaint: \`${duplicateCheck.existingComplaint.complaintId}\`\n\n🔄 Type "Hi" to report a different pothole\n\n🙏 _Authorities are already working on this report_`;
      }

      await sendWABATextMessage(phoneNumber, message);

      // Reset to language selection for new report
      session.state = "language_selection";
      await setSession(phoneNumber, session);
      return;
    }

    // Store location in session
    session.latitude = lat;
    session.longitude = lng;
    session.state = "awaiting_image";
    await setSession(phoneNumber, session);

    return requestImage(phoneNumber, session.language);
  } else {
    return requestLocation(phoneNumber, session.language);
  }
}

export { handleLocationInput, requestLocation };
