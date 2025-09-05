# Content Types Overview

## Content template support on API vs. Console

All content template types will appear on the content templates. Content template types that are supported on API only will display the following pop-up when opened in the console.

![Content template types supported on API.](https://docs-resources.prod.twilio.com/332150775b6968476f516f0f9c14a4b73441a1c19161249eeaf8257d3d668f63.png)

| Content type            | Console | API |
| ----------------------- | ------- | --- |
| twilio/text             | Yes     | Yes |
| twilio/media            | Yes     | Yes |
| twilio/location         | No      | Yes |
| twilio/list-picker      | Yes     | Yes |
| twilio/call-to-action   | Yes     | Yes |
| twilio/quick-reply      | Yes     | Yes |
| twilio/card             | Yes     | Yes |
| twilio/carousel         | Yes     | Yes |
| twilio/catalog          | Yes     | Yes |
| twilio/pay              | No      | Yes |
| twilio/flows            | No      | Yes |
| whatsapp/authentication | Yes     | Yes |
| whatsapp/card           | Yes     | Yes |

## Channel support and priority order

Twilio supports the content types provided in the following table. This table lists the content types in order of content complexity. This ranges from the least complex content (`twilio/text`) to the most content (`whatsapp/authentication`). When message handles multiple content types, Twilio sends the most complex translation that the chosen channel supports.

| Content Type            | SMS | MMS | RCS | [WhatsApp](https://developers.facebook.com/docs/whatsapp) | [Messenger](https://developers.facebook.com/docs/messenger-platform/send-messages) |
| ----------------------- | --- | --- | --- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| twilio/text             | Yes |     | Yes | Yes                                                       | Yes                                                                                |
| twilio/media            |     | Yes | Yes | Yes                                                       | Yes                                                                                |
| twilio/location         |     |     |     | Yes                                                       |                                                                                    |
| twilio/quick-replies    |     |     |     | Yes                                                       | Yes                                                                                |
| twilio/call-to-action   |     |     |     | Yes                                                       | Yes                                                                                |
| twilio/list-picker      |     |     |     | Yes                                                       |                                                                                    |
| twilio/card             |     |     | Yes | Yes                                                       | Yes                                                                                |
| twilio/carousel         |     |     | Yes | Yes                                                       | No                                                                                 |
| twilio/catalog          |     |     |     | Yes                                                       | No                                                                                 |
| twilio/pay              |     |     |     | Yes                                                       |                                                                                    |
| twilio/flows            |     |     |     | Yes                                                       |                                                                                    |
| whatsapp/card           |     |     |     | Yes                                                       |                                                                                    |
| whatsapp/authentication |     |     |     | Yes                                                       |                                                                                    |

## Channel media type support

Twilio supports the following [media types](/docs/messaging/guides/accepted-mime-types).

| Content Type | SMS | MMS | RCS | [WhatsApp](https://developers.facebook.com/docs/whatsapp) | [Messenger](https://developers.facebook.com/docs/messenger-platform/send-messages) |
| ------------ | --- | --- | --- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Images       |     | Yes | Yes | Yes                                                       | Yes                                                                                |
| Video        |     | Yes | Yes | Yes                                                       | Yes                                                                                |
| Document     |     | Yes | Yes | Yes                                                       | Yes                                                                                |
| Audio        |     | Yes | Yes | In session only                                           | Yes                                                                                |

## WhatsApp approval requirements

To send messages to WhatApp users, WhatsApp must approve your content template. Another API request handles this approval. WhatsApp allows replies to inbound messages without a content template for some content types.

| Twilio content type     | User initiated: 24 hour session (initiated by inbound message)                                           | Business initiated: out of session (initiated by a business - no inbound message) |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| twilio/text             | ✅ Can reply to inbound messages                                                                          | ⚠️ Content template approval required to send outbound messages                   |
| twilio/media            | ✅ Can reply to inbound messages                                                                          | ⚠️ Content template approval required to send outbound messages                   |
| twilio/location         | ✅ Can reply to inbound messages                                                                          | ❌ Not supported                                                                   |
| twilio/call-to-action   | ⚠️ Content template approval may be required to reply to inbound messages based on buttons types present | ⚠️ Content template approval required to send outbound messages                   |
| twilio/quick-reply      | ✅ Can reply to inbound messages                                                                          | ⚠️ Content template approval required to send outbound messages                   |
| twilio/list-picker      | ✅ Can reply to inbound messages                                                                          | ❌ Not supported                                                                   |
| twilio/card             | ⚠️ Content template approval may be required to reply to inbound messages based on buttons types present | ⚠️ Content template approval required to send outbound messages                   |
| twilio/carousel         | ⚠️ Content template approval required to reply to inbound messages                                       | ⚠️ Content template approval Required to send outbound messages                   |
| twilio/catalog          | ✅ Can reply to inbound messages                                                                          | ⚠️ Content template approval Required to send outbound messages                   |
| twilio/pay              | ✅ Can reply to inbound messages                                                                          | ❌ Not supported                                                                   |
| twilio/flows            | ⚠️ Content template approval required to reply to inbound messages                                       | ⚠️ Content template approval Required to send outbound messages                   |
| whatsapp/card           | ⚠️ Content template approval may be required to reply to inbound messages based on buttons types present | ⚠️ Content template approval required to send outbound messages                   |
| whatsapp/authentication | ⚠️ Content template approval required to reply to inbound messages                                       | ⚠️ Content template approval required to send outbound messages                   |

## WhatsApp approval statuses

Whatsapp content templates can have the following statuses:

| Status        | Description                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Unsubmitted` | The content template hasn't been submitted to Twilio or WhatsApp for any sort of approval. These content templates might still be used in session for some channels and in some WhatsApp sessions subject to the WhatsApp approval requirements listed above.       |
| `Received`    | The content template approval request has been received by Twilio. it's not yet in review by WhatsApp.                                                                                                                                                              |
| `Pending`     | The content template is under review by WhatsApp. Review can take up to 24 hours.                                                                                                                                                                                   |
| `Approved`    | The content template has been approved by WhatsApp and can be used to notify customers.                                                                                                                                                                             |
| `Rejected`    | The content template has been rejected by WhatsApp during the review process.                                                                                                                                                                                       |
| `Paused`      | The content template has been paused by WhatsApp due to recurring negative feedback from end users, typically resulting from "block" and "report spam" actions associated with The content template. Message templates with this status can't be sent to end users. |
| `Disabled`    | The content template has been disabled by WhatsApp due to recurring negative feedback from end users or for violating one or more of WhatsApp's policies. Message templates with this status can't be sent to end users.                                            |

## Common components

The following parameters are used as an array in the `actions` parameter of `twilio/quick-reply`, `twilio/call-to-action`, and `twilio/card` content types:

| Parameter        | Type          | Required                                  | [Variable support](/docs/content/using-variables-with-content-api)                                   | Description                                                                                                                                                                                                                                             |
| ---------------- | ------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | string (enum) | Yes                                       | No                                                                                                   | The type of action:<br /><ul><li>Call to Action Values: `URL`, `PHONE_NUMBER`</li><li>Quick Reply Value: `QUICK_REPLY`</li><li>Card Values: `URL`, `PHONE_NUMBER`, `QUICK_REPLY`</li><li>whatsapp/authentication: `COPY_CODE`</li></ul>                 |
| `title`          | string        | Yes, except for `whatsapp/authentication` | Yes, except for `QUICK_REPLY` buttons on content templates for WhatsApp business initiated messages. | Display value for the action. For type `QUICK_REPLY`, this is the message that will be sent back when the user taps on the button.<br /><ul><li>Maximum length for WhatsApp: 25 characters</li><li>Maximum length for Facebook: 20 characters</li></ul> |
| `url`            | string        | No, except for `URL`                      | Yes                                                                                                  | URL to direct to when the recipient taps the button.                                                                                                                                                                                                    |
| `phone`          | string (enum) | No, except for `PHONE_NUMBER`             | No                                                                                                   | [E.164](/docs/glossary/what-e164) formatted phone number to call when the recipient taps the button.                                                                                                                                                    |
| `id`             | string (enum) | No                                        | Yes                                                                                                  | Postback payload. This field isn't visible to the end user.<br /><ul><li>Maximum length for WhatsApp: 128 characters</li><li>Maximum length for unapproved WhatsApp templates in session: 256 characters</li></ul>                                      |
| `copy_code_text` | string        | No, except for `whatsapp/authentication`  | No                                                                                                   | Display value for the Copy Code button.                                                                                                                                                                                                                 |