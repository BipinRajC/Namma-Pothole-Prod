import { setSession } from "../utils/redisUtils.js";
import {
  sendWABATextMessage,
  sendWABAButtonMessage,
} from "../utils/wabaHelperFns.js";
import { requestLocation } from "./locationState.js";
import { checkRateLimit, getTodayComplaintCount } from "../utils/mongoUtils.js";

// Send language selection with improved messaging
async function sendLanguageSelection(phoneNumber) {
  try {
    const message = `🙏 ನಮಸ್ಕಾರ\n\nWelcome to Namma Pothole !\n\nHelp make our city's roads better by reporting potholes.\n\nಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language`;

    const buttons = ["ಕನ್ನಡ", "English"];

    await sendWABAButtonMessage(phoneNumber, message, buttons);
  } catch (error) {
    console.error("❌ Error sending language selection:", error);
  }
}

// Handle language selection - now goes directly to location request
async function handleLanguageSelection(session, phoneNumber, response) {
  try {
    let selectedLanguage = null;

    if (response) {
      const text = response.toLowerCase();
      if (text.includes("english")) {
        selectedLanguage = "english";
      } else if (text.includes("ಕನ್ನಡ")) {
        selectedLanguage = "kannada";
      }
    }

    if (selectedLanguage) {
      // Check rate limiting before proceeding
      const canReport = await checkRateLimit(phoneNumber);

      if (!canReport) {
        const complaintCount = await getTodayComplaintCount(phoneNumber);
        let message;

        if (selectedLanguage === "kannada") {
          message = `❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ\n\nನೀವು ಇಂದು ${complaintCount} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.`;
        } else {
          message = `❌ Daily limit reached (15 reports max)\n\nYou have submitted ${complaintCount} reports today. Please try again tomorrow.`;
        }

        await sendWABATextMessage(phoneNumber, message);
        return;
      }

      session.language = selectedLanguage;
      session.state = "awaiting_location";
      await setSession(phoneNumber, session);
      return requestLocation(phoneNumber, selectedLanguage);
    } else {
      return sendLanguageSelection(phoneNumber);
    }
  } catch (error) {
    console.error("Error in handleLanguageSelection:", error);
    await sendWABATextMessage(
      phoneNumber,
      'Sorry, something went wrong. Please type "Hi" to start again.'
    );
  }
}

export { handleLanguageSelection, sendLanguageSelection };
