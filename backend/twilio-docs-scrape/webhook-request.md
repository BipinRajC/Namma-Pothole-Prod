# Twilio's request to your incoming message Webhook URL

When an incoming message arrives at your Twilio phone number, Twilio sends a request to your web application via a [webhook](/docs/usage/webhooks/messaging-webhooks) request. This request contains information about the incoming message, such as its sender and any attached media. Your application can store this data or use it for customizing a response, for example.

Twilio makes HTTP requests to your application, just like a regular web browser, in the format `application/x-www-form-urlencoded`. By including parameters and values in its requests, Twilio sends data to your application that you can act upon before responding.

You can configure the URLs and HTTP Methods Twilio uses to make its requests via your [account portal in the Twilio Console](https://www.twilio.com/console) or using the [REST API](/docs/messaging/api).

Twilio cannot cache `POST` requests. If you want Twilio to cache static TwiML pages, then configure Twilio to make requests to your application using `GET`.

> \[!CAUTION]
>
> The parameters included in StatusCallback events vary by channel and event type and are subject to change in the future. Twilio will occasionally add new parameters without advance notice. When integrating with webhooks, it is important that your implementation is able to accept and correctly run signature validation on an evolving set of parameters. We strongly recommend using the provided [signature validation](/docs/usage/webhooks/webhooks-security) library from a Twilio SDK and not implementing your own signature validation.

## Parameters in Twilio's Request to your Application

When Twilio receives a message at one of your Twilio numbers or a [WhatsApp](/docs/whatsapp)-enabled number, it makes a synchronous HTTP request to the message URL configured for that number or [Messaging Service](/docs/messaging/services) and expects to receive [TwiML](/docs/messaging/twiml) in response.

Twilio sends the following parameters with its request as `POST` parameters or URL query parameters, depending on which HTTP method you've configured:

### Request parameters

| PARAMETER           | DESCRIPTION                                                                                                     | **EXAMPLE**                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| MessageSid          | A 34 character unique identifier for the message. May be used to later retrieve this message from the REST API. | `SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`   |
| SmsSid              | Same value as MessageSid. Deprecated and included for backward compatibility.                                   | `SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`   |
| SmsMessageSid       | Same value as MessageSid. Deprecated and included for backward compatibility.                                   | `SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`   |
| AccountSid          | The 34 character id of the [Account](/docs/iam/api/account) this message is associated with.                    | `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`   |
| MessagingServiceSid | The 34 character id of the [Messaging Service](/docs/messaging/quickstart) associated with the message.         | `MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`   |
| From                | The phone number or [Channel address](/docs/messaging/channels) that sent this message.                         | `+14017122661`                         |
| To                  | The phone number or [Channel address](/docs/messaging/channels) of the recipient.                               | `+15558675310`                         |
| Body                | The text body of the message. Up to 1600 characters long.                                                       | `Ahoy! Let's build something amazing.` |
| NumMedia            | The number of media items associated with your message                                                          | `0`                                    |
| NumSegments         | The number of message segments. (The value is always 1 for non-SMS/MMS messages.)                               | `1`                                    |

### Media-related Parameters

Twilio also sends the following parameters when there are media, such as images, associated with the incoming message:

| PARAMETER            | DESCRIPTION                                                                                                                                                                                                                                                                                         | EXAMPLE                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MediaContentType\{N} | The ContentTypes for the Media stored at MediaUrl\{N}. The order of MediaContentType\{N} matches the order of MediaUrl\{N}. If more than one media element is indicated by NumMedia than MediaContentType\{N} will be used, where N is the zero-based index of the Media (e.g. `MediaContentType0`) | image/jpeg                                                                                                                                                                    |
| MediaUrl\{N}         | A URL referencing the content of the media received in the Message. If more than one media element is indicated by NumMedia than MediaUrl\{N} will be used, where N is the zero-based index of the Media (e.g. `MediaUrl0`)                                                                         | `https://api.twilio.com/2010-04-01` `/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` `/Messages/MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/` `Media/MEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

### Geographic Data-related Parameters

Twilio also attempts to look up geographic data based on the 'From' and 'To' phone numbers. Twilio sends the following parameters, if available:

| PARAMETER   | DESCRIPTION                             | **EXAMPLE**   |
| ----------- | --------------------------------------- | ------------- |
| FromCity    | The city of the sender                  | SAN FRANCISCO |
| FromState   | The state or province of the sender.    | CA            |
| FromZip     | The postal code of the called sender.   | 94103         |
| FromCountry | The country of the called sender.       | US            |
| ToCity      | The city of the recipient.              | SAUSALITO     |
| ToState     | The state or province of the recipient. | CA            |
| ToZip       | The postal code of the recipient.       | 94965         |
| ToCountry   | The country of the recipient.           | US            |

### WhatsApp-specific Parameters

For WhatsApp messages, Twilio sends additional parameters:

| **PARAMETER**       | **DESCRIPTION**                                                                                                                | **EXAMPLE**        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| ProfileName         | The sender's WhatsApp profile name                                                                                             | Perspective Coffee |
| WaId                | The sender's WhatsApp ID (typically a phone number)                                                                            | 14017122661        |
| Forwarded           | `true` if the message has been forwarded once                                                                                  | `true`             |
| FrequentlyForwarded | `true` if the message has been [frequently forwarded](https://faq.whatsapp.com/general/chats/about-forwarding-limits/?lang=en) | `true`             |
| ButtonText          | The text of a Quick reply button                                                                                               | Cancel Appointment |

For incoming WhatsApp [messages that share a location](/docs/whatsapp/message-features), Twilio includes the following parameters:

| **PARAMETER** | **DESCRIPTION**                        | **EXAMPLE**                                      |
| ------------- | -------------------------------------- | ------------------------------------------------ |
| Latitude      | Latitude value of location being sent  | 51.51322977399644                                |
| Longitude     | Longitude value of location being sent | -0.2197976373036567                              |
| Address       | Address of location being sent         | 187 Freston Road, London, Greater London W10 6TH |
| Label         | Label or name of location being sent   | The Harrow Club                                  |

For incoming WhatsApp messages that originate from a ["Click-to-WhatsApp" advertisement](https://www.facebook.com/business/help/447934475640650?id=371525583593535), Twilio includes the following parameters:

| **PARAMETER**            | **DESCRIPTION**                                                                                                                                    | **EXAMPLE**                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ReferralBody             | Body text of the advertisement                                                                                                                     | Learn more about our company by sending us a message on WhatsApp                                                                                                              |
| ReferralHeadline         | Headline text of the advertisement                                                                                                                 | Send us a message                                                                                                                                                             |
| ReferralSourceId         | Meta/WhatsApp's ID of the advertisement                                                                                                            | 118588094077142                                                                                                                                                               |
| ReferralSourceType       | The type of the advertisement                                                                                                                      | post                                                                                                                                                                          |
| ReferralSourceUrl        | A URL referencing the content of the media shown in the advertisement when the user clicked to send a message                                      | `https://fb.me/xyz123`                                                                                                                                                        |
| ReferralMediaId          | Meta/WhatsApp's ID of the advertisement media shown when the users clicked to send a message; this will *not* match the Twilio Media SID           | e420b130-f934-4acf-a5e6-f964f776bxyz                                                                                                                                          |
| ReferralMediaContentType | Media ContentType of the advertisement media shown to the user when the user clicked to send a message                                             | image/jpeg                                                                                                                                                                    |
| ReferralMediaUrl         | A URL referencing the media shown to the user in the advertisement                                                                                 | `https://api.twilio.com/2010-04-01` `/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` `/Messages/MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` `/Media/MEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| ReferralNumMedia         | The number of media items associated with a "Click to WhatsApp" advertisement.                                                                     | 0                                                                                                                                                                             |
| ReferralCtwaClid         | The ID associated with a click to a "Click to WhatsApp" advertisement for integrating WhatsApp business messaging events to Meta's Conversions API | ARAkLkA8rmlFeiCktEJQ-QTwRiyYHAFDLMNDBH0CD3qpjd0HR4irJ6LEkR7JwFF4XvnO2E4Nx0-eM-GABDLOPaOdRMv-\_zfUQ2a                                                                          |

For messages that are replies to a specific message sent in the previous 7 days, Twilio will send these additional parameters:

| **PARAMETER**                | **DESCRIPTION**                                                     | **EXAMPLE**                          |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| OriginalRepliedMessageSender | The Sender of the original message that this message is replying to | whatsapp:+14017122661                |
| OriginalRepliedMessageSid    | The SID of the original message that this message is replying to    | `SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

### Status Callbacks

In the context of Twilio documentation, status callbacks (and the webhooks configured for these) generally refer to events raised by the lifecycle of **outgoing** messages, rather than incoming messages as discussed on this page. Although incoming messages can theoretically also raise status callback events, the statues involved here can only be `receiving` (a very transitory state) or `received`; if an incoming message has failed to be received by Twilio or has not yet been received, then by definition Twilio cannot raise an event for such a message. Thus, incoming-message status callbacks have very little practical application. On the other hand, outgoing messages will change their status repeatedly throughout an entire lifecycle, and these status changes can be tracked by means of status callbacks and webhooks configured to receive them. For more information on outgoing-message status callbacks and webhooks, see [this guide](/docs/messaging/guides/outbound-message-status-in-status-callbacks).