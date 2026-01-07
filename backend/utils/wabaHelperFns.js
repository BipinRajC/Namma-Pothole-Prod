import axios from "axios";
import {
  WABA_BASE_URL,
  WABA_LICENSE_NUMBER,
  WABA_API_KEY,
} from "./constants.js";

// WABA Helper Functions
async function sendWABATextMessage(phoneNumber, message) {
  try {
    const url = `${WABA_BASE_URL}/sendtextmessage.php`;
    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber.replace(/^\+?91/, "")}`,
      Message: message,
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
    console.error("❌ Error sending WABA text message:", {
      error: error.message,
      phoneNumber,
      response: error.response?.data,
    });
    throw error;
  }
}

async function sendWABAMediaMessage(phoneNumber, mediaUrl, caption = "") {
  try {
    const url = `${WABA_BASE_URL}/sendmediamessage.php`;
    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber.replace(/^\+?91/, "")}`,
      Type: "image",
      FileURL: mediaUrl,
      Message: caption,
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
    console.error("❌ Error sending WABA media message:", {
      error: error.message,
      phoneNumber,
      response: error.response?.data,
    });
    throw error;
  }
}

async function sendWABAButtonMessage(phoneNumber, message, buttons = []) {
  try {
    const url = `${WABA_BASE_URL}/sendmediamessage.php`;

    // Format buttons for WABA - each button as separate parameter
    const buttonText = buttons.length > 0 ? buttons.join(",") : "";

    const params = {
      LicenseNumber: WABA_LICENSE_NUMBER,
      APIKey: WABA_API_KEY,
      Contact: phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber.replace(/^\+?91/, "")}`,
      Message: message,
      Type: "button",
      HeaderType: "text",
      HeaderText: "",
      Button: buttonText,
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
    console.error("❌ Error sending WABA button message:", {
      error: error.message,
      phoneNumber,
      response: error.response?.data,
    });
    throw error;
  }
}

export { sendWABATextMessage, sendWABAMediaMessage, sendWABAButtonMessage };
