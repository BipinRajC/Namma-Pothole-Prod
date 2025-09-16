# WABA Connect API Endpoints

This document outlines the API endpoints for sending various types of messages via the WABA Connect service. All endpoints use the `GET` method.

---

## Send Text Message

This endpoint is used to send a standard text message to a contact.

**Endpoint:**
`https://login.wabaconnect.com/api/sendtextmessage.php`

**Method:**
 `GET`

**Parameters:**

| Parameter      | Placeholder      | Description                               |
| :------------- | :--------------- | :---------------------------------------- |
| `LicenseNumber`| `LICENSE_NUMBER` |  Your unique license number. [cite: 30]                |
| `APIKey`       | `API_KEY`        |  Your unique API Key for authentication. [cite: 30]  |
| `Contact`      | `91XXXXXXXXXX`   |  The recipient's contact number. [cite: 30]        |
| `Message`      | `XXXXXXXXXX`     |  The text content of the message. [cite: 30]         |

**Example URL:**
 `https://login.wabaconnect.com/api/sendtextmessage.php?LicenseNumber=LICENSE_NUMBER&APIKey=API_KEY&Contact=91XXXXXXXXXX&Message=XXXXXXXXXX`

---

## Send Media Message

This endpoint sends a media file (e.g., audio, image, video, document) to a contact.

**Endpoint:**
 `https://login.wabaconnect.com/api/sendmediamessage.php`

**Method:**
 `GET` 

**Parameters:**

| Parameter      | Placeholder      | Description                                  |
| :------------- | :--------------- | :------------------------------------------- |
| `LicenseNumber`| `LICENSE_NUMBER` |  Your unique license number. [cite: 37]                 |
| `APIKey`       | `API_KEY`        |  Your unique API Key for authentication. [cite: 38]     |
| `Contact`      | `91XXXXXXXXXX`   |  The recipient's contact number. [cite: 39]           |
| `Type`         | `audio`          |  The type of media (e.g., audio, image, video). [cite: 40, 45] |
| `FileURL`      | `XXXXXXXX`       |  The direct URL to the media file. [cite: 41]            |

**Example URL:**
 `https://login.wabaconnect.com/api/sendmediamessage.php?LicenseNumber=LICENSE_NUMBER&APIKey=API_KEY&Contact=91XXXXXXXXXX&Type=audio&FileURL=XXXXXXXX`

---

## Send Button Message

This endpoint sends a message with interactive buttons.

**Endpoint:**
 `https://login.wabaconnect.com/api/sendmediamessage.php`

**Method:**
 `GET`

**Parameters:**

| Parameter      | Placeholder      | Description                                    |
| :------------- | :--------------- | :--------------------------------------------- |
| `LicenseNumber`| `LICENSE_NUMBER` |  Your unique license number. [cite: 52]                   |
| `APIKey`       | `API_KEY`        |  Your unique API Key for authentication. [cite: 53]       |
| `Contact`      | `91XXXXXXXXXX`   |  The recipient's contact number. [cite: 54]             |
| `Message`      | `XXXXXXXXXX`     |  The main body text of the message. [cite: 55]            |
| `Type`         | `button`         |  Specifies the message type as 'button'. [cite: 56, 64]      |
| `HeaderType`   | `XXXXXXXX`       |  The type of header (e.g., text, image). [cite: 57]        |
| `HeaderText`   | `XXXXXXXX`       |  Text for the header. [cite: 58]                         |
| `HeaderURL`    | `XXXXXXXX`       |  URL for media in the header. [cite: 59]                  |
| `FooterText`   | `XXXXXXXX`       |  Text for the footer section. [cite: 68]                   |
| `Button`       | `XXXXXXXX`       |  The button text/payload. [cite: 72]                        |

**Example URL:**
 `https://login.wabaconnect.com/api/sendmediamessage.php?LicenseNumber=LICENSE_NUMBER&APIKey=API_KEY&Contact=91XXXXXXXXXX&Message=XXXXXXXXXX&Type=button&HeaderType=XXXXXXXX&HeaderText=XXXXXXXX&HeaderURL=XXXXXXXX&FooterText=XXXXXXXX&Button=XXXXXXXX`

---

## Send List Message

This endpoint sends a message that presents the user with a list of options to choose from.

**Endpoint:**
 `https://login.wabaconnect.com/api/sendmediamessage.php`

**Method:**
 `GET` 

**Parameters:**

| Parameter        | Placeholder        | Description                                           |
| :--------------- | :----------------- | :---------------------------------------------------- |
| `LicenseNumber`  | `LICENSE_NUMBER`   |  Your unique license number. [cite: 80]                          |
| `APIKey`         | `API_KEY`          |  Your unique API Key for authentication. [cite: 80]              |
| `Contact`        | `91XXXXXXXXXX`     |  The recipient's contact number. [cite: 80]                    |
| `Message`        | `XXXXXXXXXX`       |  The main body text of the message. [cite: 80]                   |
| `Type`           | `list`             |  Specifies the message type as 'list'. [cite: 80]              |
| `HeaderType`     | `XXXXXXXXXX`       |  The type of header. [cite: 80]                                |
| `HeaderText`     | `XXXXXXXXXX`       |  Text for the header. [cite: 80]                               |
| `FooterText`     | `XXXXXXXXXX`       |  Text for the footer section. [cite: 80]                          |
| `ListButtonText` | `XXXXXXXXXX`       |  The text displayed on the button that reveals the list. [cite: 80] |
| `SectionText`    | `XXXXXXXXXX`       |  The title for a section within the list. [cite: 80]               |
| `Button`         | `XX.XX...`         |  The list items/buttons, formatted as specified. [cite: 80]      |

**Example URL:**
 `https://login.wabaconnect.com/api/sendmediamessage.php?LicenseNumber=LICENSE_NUMBER&APIKey=API_KEY&Contact=91XXXXXXXXXX&Message=XXXXXXXXXX&Type=list&HeaderType=XXXXXXXXXX&HeaderText=XXXXXXXXXX&FooterText=XXXXXXXXXX&ListButtonText=XXXXXXXXXX&SectionText=XXXXXXXXXX&Button=XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX` 