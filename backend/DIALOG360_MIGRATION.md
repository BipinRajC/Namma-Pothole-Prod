# Dialog360 Migration Guide

This document outlines the migration from Twilio to Dialog360 for the Namma Pothole WhatsApp Bot.

## Overview

The bot has been migrated to use Dialog360's WhatsApp Cloud API instead of Twilio. The main changes include:

1. **Template Messages**: Instead of plain text messages, the bot now uses Meta-approved message templates with buttons and images
2. **Interactive Elements**: Users can now click buttons instead of typing responses
3. **Media Handling**: Updated to use Dialog360's media API endpoints
4. **Webhook Format**: Updated to handle Dialog360's webhook payload structure

## Required Template Messages

You need to create the following templates in Meta Business Manager with the exact names specified:

### 1. Language Selection Template
**Template Name**: `language_selection_template`
**Category**: Utility
**Language**: English (en)

```
🙏 ನಮಸ್ಕಾರ {{1}}!

Welcome to *Namma Bengaluru Pothole Reporter*! 🛣️

Help make our city's roads better by reporting potholes to BBMP.

ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / Choose your language:
```

**Buttons**:
- English
- ಕನ್ನಡ

### 2. Location Request Templates

#### English Template
**Template Name**: `location_request_english`
**Category**: Utility
**Language**: English (en)

```
🛣️ *Namma Bengaluru Pothole Report*

📍 Please share the pothole location using the steps shown in the image above:

🔹 Tap the 📎 *Attach* icon in WhatsApp
🔹 Select *Location*
🔹 Click *Send your current location*
🔹 Move the marker to exact pothole spot

⚠️ _Only locations within Bengaluru city limits accepted_

🏛️ Your report will be sent to BBMP for action.
```

**Header**: Image (location sharing instructions)

#### Kannada Template
**Template Name**: `location_request_kannada`
**Category**: Utility
**Language**: Hindi (hi) - for Kannada script support

```
🛣️ *ನಮ್ಮ ಬೆಂಗಳೂರು ಗಂಡಿ ವರದಿ*

📍 ಮೇಲಿನ ಚಿತ್ರದಲ್ಲಿ ತೋರಿಸಿದ ಹಂತಗಳನ್ನು ಬಳಸಿ ಗಂಡಿಯ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:

🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ
🔹 *Location* ಆಯ್ಕೆ ಮಾಡಿ
🔹 *Send your current location* ಕ್ಲಿಕ್ ಮಾಡಿ
🔹 ಗಂಡಿಯ ನಿಖರ ಸ್ಥಳಕ್ಕೆ ಮಾರ್ಕರ್ ಸರಿಸಿ

⚠️ _ಬೆಂಗಳೂರಿನ ಒಳಗಿನ ಸ್ಥಳಗಳು ಮಾತ್ರ ಸ್ವೀಕಾರ_
```

**Header**: Image (location sharing instructions)

### 3. Image Choice Templates

#### English Template
**Template Name**: `image_choice_english`
**Category**: Utility
**Language**: English (en)

```
📸 *Pothole Photo*

Would you like to upload a photo of the pothole?

💡 _Photos help BBMP assess the severity better_
```

**Buttons**:
- Yes ✅
- No ❌

#### Kannada Template
**Template Name**: `image_choice_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
📸 *ಗಂಡಿಯ ಫೋಟೋ*

ದಯವಿಟ್ಟು ಗಂಡಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?

💡 _ಫೋಟೋ ಇರುವುದರಿಂದ BBMP ಗೆ ಹೆಚ್ಚು ಸಹಾಯಕವಾಗುತ್ತದೆ_
```

**Buttons**:
- ಹೌದು ✅
- ಬೇಡ ❌

### 4. Image Request Templates

#### English Template
**Template Name**: `image_request_english`
**Category**: Utility
**Language**: English (en)

```
📸 *Send Pothole Photo*

🔹 Tap the 📎 *Attach* icon in WhatsApp
🔹 Select *Camera* or *Gallery*
🔹 Choose a clear photo of the pothole

💡 *Tips for better photos:*
• Take photo close to the pothole
• Show the size clearly
• Include surrounding road context
• Ensure good lighting
```

#### Kannada Template
**Template Name**: `image_request_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
📸 *ಗಂಡಿಯ ಫೋಟೋ ಕಳುಹಿಸಿ*

🔹 WhatsApp ನಲ್ಲಿ 📎 *Attach* ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ
🔹 *Camera* ಅಥವಾ *Gallery* ಆಯ್ಕೆ ಮಾಡಿ
🔹 ಗಂಡಿಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ

💡 *ಟಿಪ್ಸ್:*
• ಗಂಡಿಯ ಹತ್ತಿರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ
• ಗಂಡಿಯ ಗಾತ್ರ ಚೆನ್ನಾಗಿ ತೋರುವಂತೆ ಮಾಡಿ
• ಸುತ್ತಮುತ್ತಲ ರಸ್ತೆ ಕೂಡ ತೋರಿಸಿ
```

### 5. Success Templates

#### English Template
**Template Name**: `success_english`
**Category**: Utility
**Language**: English (en)

```
✅ *Pothole Report Submitted Successfully!*

🆔 Complaint ID: `{{1}}`
📍 Location: {{2}}, {{3}}
📸 Status: {{4}}

🏛️ Your report has been sent to BBMP

🙏 Thank you for helping improve Namma Bengaluru!

🔄 Type "Hi" to submit another report
```

#### Kannada Template
**Template Name**: `success_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
✅ *ಗಂಡಿ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!*

🆔 ದೂರು ಐಡಿ: `{{1}}`
📍 ಸ್ಥಳ: {{2}}, {{3}}
📸 ಸ್ಥಿತಿ: {{4}}

🏛️ ನಿಮ್ಮ ವರದಿಯನ್ನು BBMP ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ

🙏 ನಮ್ಮ ಬೆಂಗಳೂರನ್ನು ಉತ್ತಮಗೊಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!

🔄 ಮತ್ತೊಂದು ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ
```

### 6. Error Templates

#### English Template
**Template Name**: `error_english`
**Category**: Utility
**Language**: English (en)

```
❌ {{1}}

🔄 Please type "Hi" to try again

💡 Need help? Our system is designed to guide you through each step.
```

#### Kannada Template
**Template Name**: `error_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
❌ {{1}}

🔄 ದಯವಿಟ್ಟು "Hi" ಟೈಪ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ

💡 ಸಹಾಯ ಬೇಕೇ? ನಮ್ಮ ಸಿಸ್ಟಮ್ ಪ್ರತಿ ಹಂತದಲ್ಲೂ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.
```

### 7. Rate Limit Templates

#### English Template
**Template Name**: `rate_limit_english`
**Category**: Utility
**Language**: English (en)

```
❌ Daily limit reached (15 reports max)

You have submitted {{1}} reports today. Please try again tomorrow.

🙏 Thank you for your enthusiasm in helping improve our city!

Namaste! 🙏
```

#### Kannada Template
**Template Name**: `rate_limit_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
❌ ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 15 ವರದಿಗಳು ಮಾತ್ರ

ನೀವು ಇಂದು {{1}} ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಾಳೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.

🙏 ನಮ್ಮ ನಗರವನ್ನು ಸುಧಾರಿಸಲು ನಿಮ್ಮ ಉತ್ಸಾಹಕ್ಕೆ ಧನ್ಯವಾದಗಳು!

ನಮಸ್ಕಾರ! 🙏
```

### 8. Duplicate Templates

#### English Template
**Template Name**: `duplicate_english`
**Category**: Utility
**Language**: English (en)

```
⚠️ *Duplicate Report Detected*

Pothole already reported at this location!

📍 Distance: {{1}}m away
🆔 Existing complaint: `{{2}}`

🔄 Type "Hi" to report a different pothole

🙏 _BBMP is already working on this report_
```

#### Kannada Template
**Template Name**: `duplicate_kannada`
**Category**: Utility
**Language**: Hindi (hi)

```
⚠️ *ಡುಪ್ಲಿಕೇಟ್ ರಿಪೋರ್ಟ್*

ಈ ಸ್ಥಳದಲ್ಲಿ ಈಗಾಗಲೇ ಗಂಡಿ ವರದಿಯಾಗಿದೆ!

📍 ದೂರ: {{1}} ಮೀಟರ್
🆔 ಅಸ್ತಿತ್ವದ ದೂರು: `{{2}}`

🔄 ಬೇರೆ ಗಂಡಿ ವರದಿ ಮಾಡಲು "Hi" ಟೈಪ್ ಮಾಡಿ

🙏 _BBMP ಈಗಾಗಲೇ ಈ ವರದಿಯನ್ನು ಪರಿಗಣಿಸುತ್ತಿದೆ_
```

## Environment Variables

Add these to your `.env` file:

```bash
# Dialog360 Configuration
DIALOG360_API_KEY=your_dialog360_api_key_here
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
```

## Migration Steps

1. **Create Templates**: Create all the above templates in Meta Business Manager and get them approved
2. **Update Environment**: Add Dialog360 API key and webhook verify token to environment variables
3. **Install Dependencies**: Run `npm install` to install axios dependency
4. **Switch Files**: Rename current `index.js` to `index-twilio.js` and rename `index-dialog360.js` to `index.js`
5. **Update Webhook URL**: Configure your webhook URL in Dialog360 dashboard
6. **Test**: Test the bot thoroughly with all flows

## Key Differences from Twilio

1. **Webhook Format**: Dialog360 uses WhatsApp Cloud API webhook format
2. **Message Sending**: Uses HTTP POST requests instead of TwiML responses
3. **Media Handling**: Uses Dialog360 media endpoints for downloading media
4. **Interactive Elements**: Supports buttons and list messages natively
5. **Template Approval**: All message templates must be approved by Meta before use

## Benefits of Migration

1. **Better User Experience**: Interactive buttons instead of typing
2. **Rich Media Support**: Images in template messages
3. **Better Compliance**: Direct integration with Meta's approved system
4. **Cost Effective**: Potentially lower costs compared to Twilio
5. **Advanced Features**: Access to WhatsApp Business API features

## Deployment Notes

- Ensure all templates are approved before switching to production
- Keep the Twilio implementation as backup until Dialog360 is fully tested
- Monitor webhook deliveries to ensure reliability
- Test all language flows (English and Kannada)
- Verify media upload/download functionality

## Support

For Dialog360 specific issues, refer to their documentation or contact their support team. The migration maintains the same business logic and flow while updating the underlying messaging platform.
