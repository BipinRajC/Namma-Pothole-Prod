import { sendWABATextMessage } from "../utils/wabaHelperFns.js";
import { setSession } from "../utils/redisUtils.js";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFromWABA } from "../utils/s3Utils.js";
import { newComplaint } from "../utils/mongoUtils.js";

// Request image with improved instructions
async function requestImage(phoneNumber, language) {
  let message;

  if (language === "kannada") {
    message = `📸 * ಗುಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*\n\n🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ\n🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ\n🔹  ಗುಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ\n\n💡 *ಟಿಪ್ಸ್:*\n•  ಗುಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ\n•  ಗುಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ\n• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ`;
  } else {
    message = `📸 *Send Pothole Photo*\n\n🔹 Tap the 📎 *Attach* icon in WhatsApp\n🔹 Select *Camera* or *Gallery*\n🔹 Choose a clear photo of the pothole\n\n💡 *Tips for better photos:*\n• Take photo close to the pothole\n• Show the size clearly\n• Include surrounding road context\n• Ensure good lighting`;
  }

  await sendWABATextMessage(phoneNumber, message);
}

// Handle image input with compression and save complaint
async function handleImageInput(
  session,
  phoneNumber,
  mediaUrl,
  mediaContentType
) {
  if (mediaUrl && mediaContentType && mediaContentType.startsWith("image/")) {
    try {
      // Send processing message first
      let processingMessage;
      if (session.language === "kannada") {
        processingMessage =
          "⏳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ...";
      } else {
        processingMessage =
          "⏳ Uploading and compressing photo... Please wait...";
      }

      await sendWABATextMessage(phoneNumber, processingMessage);

      // Generate complaint ID first
      const complaintId = uuidv4();

      // Upload and compress image to S3
      const s3ImageUrl = await uploadMediaFromWABA(mediaUrl, complaintId);

      if (!s3ImageUrl) {
        throw new Error("Failed to upload image to S3");
      }

      const complaintData = {
        complaintId: complaintId,
        phoneNumber: phoneNumber,
        latitude: session.latitude,
        longitude: session.longitude,
        imageUrl: s3ImageUrl,
        language: session.language,
      };

      const complaint = await newComplaint(complaintData);

      // Reset session to allow new reports
      session.state = "language_selection";
      await setSession(phoneNumber, session);

      let message;
      if (session.language === "kannada") {
        message = `✅ * ಗುಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*\n\n🆔 ದೂರು ಐಡಿ: \`${
          complaint.complaintId
        }\`\n📍 ಸ್ಥಳ: ${session.latitude.toFixed(
          6
        )}, ${session.longitude.toFixed(
          6
        )}\n📸 ಫೋಟೋ: ಸಫಲವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ\n\n🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ\n\n🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!\n\nನಿಮ್ಮ ದೂರನ್ನು nammapothole.com ನಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.\n\n🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ`;
      } else {
        message = `✅ *Pothole Report Submitted Successfully!*\n\n🆔 Complaint ID: \`${
          complaint.complaintId
        }\`\n📍 Location: ${session.latitude.toFixed(
          6
        )}, ${session.longitude.toFixed(
          6
        )}\n📸 Photo: Successfully uploaded & compressed\n\n🏛️ Your report has been sent to Authorities\n\n🙏 Thank you for helping improve Namma Bengaluru!\n\n You can view your complaint on our website: https://nammapothole.com\n\n🔄 Type "Hi" to submit another report`;
      }

      await sendWABATextMessage(phoneNumber, message);
    } catch (error) {
      console.error("Error saving complaint with image:", error);

      // Reset session state on error
      session.state = "language_selection";
      await setSession(phoneNumber, session);

      let message;
      if (session.language === "kannada") {
        message =
          '❌ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.\n\n🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ\n\n💡 ಫೋಟೋ ಇಲ್ಲದೇ ವರದಿ ಮಾಡಲೂ ಬಹುದು';
      } else {
        message =
          '❌ Error uploading photo. \n\n🔄 Please type "Hi" to try again\n\n💡 You can also report without photo';
      }
      await sendWABATextMessage(phoneNumber, message);
    }
  } else {
    // Invalid file type
    let message;
    if (session.language === "kannada") {
      message =
        "❌ ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಕಳುಹಿಸಿ\n\n📸 ಮಾನ್ಯ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: JPG, PNG, WEBP";
    } else {
      message =
        "❌ Please send a valid image file\n\n📸 Supported formats: JPG, PNG, WEBP";
    }
    await sendWABATextMessage(phoneNumber, message);
  }
}
export { requestImage, handleImageInput };
