import { setSession } from "../utils/redisUtils.js";
import {
  sendLanguageSelection,
  handleLanguageSelection,
} from "./languageState.js";
import { handleLocationInput } from "./locationState.js";
import { handleImageChoice, handleImageInput } from "./imageState.js";

// Handle WhatsApp message flow
async function handleWhatsAppMessage(session, phoneNumber, messageData) {
  const {
    body,
    buttonText,
    latitude,
    longitude,
    mediaUrl,
    mediaContentType,
    messageType,
  } = messageData;

  // Handle initial greeting or restart
  if (
    body &&
    (body.toLowerCase().includes("hi") ||
      body.toLowerCase().includes("hello") ||
      body.toLowerCase().includes("namaste"))
  ) {
    session.state = "language_selection";
    await setSession(phoneNumber, session);
    return sendLanguageSelection(phoneNumber);
  }

  switch (session.state) {
    case "language_selection":
      await handleLanguageSelection(session, phoneNumber, buttonText || body);
      break;

    case "awaiting_location":
      await handleLocationInput(
        session,
        phoneNumber,
        latitude,
        longitude,
        messageType
      );
      break;

    case "awaiting_image_choice":
      await handleImageChoice(session, phoneNumber, buttonText || body);
      break;

    case "awaiting_image":
      await handleImageInput(session, phoneNumber, mediaUrl, mediaContentType);
      break;

    default:
      return sendLanguageSelection(phoneNumber);
  }
}

export { handleWhatsAppMessage };
