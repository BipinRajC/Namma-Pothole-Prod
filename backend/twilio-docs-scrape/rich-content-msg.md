# Send Rich Content Messages with Conversations

## Overview

In this tutorial, you will learn how to send rich messages to WhatsApp using Conversations and the [Content Template Builder](/docs/content). The Content Template Builder lets users build rich content templates programmatically through an API or with no code in a graphical user interface in the console. "Rich content" or "Rich messaging" refers to messages with additional visual or interactive elements such as buttons or selectable lists.

### The Content Template Builder

With Twilio's [Content Template Builder](/docs/content), you can create message templates to send over any Twilio-supported messaging channel. It supports text and media as well as richer content types like location, quick-replies, and list-pickers. The templates also support variables, so you can leverage the same content across multiple conversations while personalizing each message.

Below is an overview of the content types currently supported by Conversations. See the individual content type documentation for additional details about each type's parameters and input requirements.

| **Content Type**                                             | **Data parameter**    | **Type**           | **Description**                                                                                                                                                                                                 |
| ------------------------------------------------------------ | --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [twilio/text](/docs/content/twilio-text)                     | body \[required]      | string             | The text of the message you want to send. Maximum 1,600 characters.                                                                                                                                             |
| [twilio/media](/docs/content/twilio-media)                   | body \[required]      | string             | The text of the message you want to send. Maximum 1,600 characters.                                                                                                                                             |
|                                                              | media \[optional]     | string\[]          | The URL of the media you want to send. - The URL must resolve to a publicly accessible media file. - The media URL must contain a [valid file type](/docs/content/content-types-overview#supported-mime-types). |
| [twilio/location](/docs/content/twilio-location)             | longitude \[required] | numbers            | The longitude value of the location pin you want to send.                                                                                                                                                       |
|                                                              | latitude \[required]  | numbers            | The latitude value of the location pin you want to send.                                                                                                                                                        |
|                                                              | label \[optional]     | string             | Label to be displayed alongside the location pin.                                                                                                                                                               |
| [twilio/quick-reply](/docs/content/twilio-quick-reply)       | body \[required]      | string             | The text of the message you want to send. Maximum 1,024 characters.                                                                                                                                             |
|                                                              | actions \[required]   | array\[actions]    | Predefined buttons that a customer could use as the response. It needs the "type", "title", and "id" fields.                                                                                                    |
| [twilio/call-to-action](/docs/content/twilio-call-to-action) | body \[required]      | string             | The text of the message you want to send. Maximum 640 characters.                                                                                                                                               |
|                                                              | actions \[required]   | array\[actions]    | Buttons that recipients can tap to act on the message. It requires the "type" and "title" actions.                                                                                                              |
| [twilio/list-picker](/docs/content/twiliolist-picker)        | body \[required]      | string             | The text of the message you want to send. Maximum 1,024 characters.                                                                                                                                             |
|                                                              | button \[required]    | string             | Display value for the primary button.                                                                                                                                                                           |
|                                                              | items \[required]     | array\[list items] | Array of list item objects.                                                                                                                                                                                     |
| [twilio/card](/docs/content/twiliocard)                      | title \[required]     | string             | Title of the card. Maximum 1,024 characters.                                                                                                                                                                    |
|                                                              | subtitle \[optional]  | string             | Subtitle of the card. Maximum 60 characters.                                                                                                                                                                    |
|                                                              | media \[optional]     | string\[]          | The URL of the media to send with the message.                                                                                                                                                                  |
|                                                              | actions \[optional]   | array\[actions]    | Buttons that recipients can tap on to act on the message.                                                                                                                                                       |

## Step 1: Create Content Template via Content API

> \[!NOTE]
>
> The Content Template Builder supports an unlimited number of templates,
> however, WhatsApp limits users to 6000 approved templates across all
> languages.

To send a rich message, you'll first need to [create a content template](/docs/content/content-api-resources#create-templates) using the [Content Template Builder](/docs/content).

In the following example, we'll use the ["quick-reply" template](/docs/content/twilio-quick-reply), which allows the recipient to respond by clicking on one of the options that you pre-define in the template. To see how the template layout looks, go to [Step 4](#step-4-send-a-rich-message-via-the-conversations-api).

After creating your template, take note of the ContentSid `(HXXXXXX)` found in the response as we'll be using that SID throughout this tutorial.

### POST API

Request:

```bash
curl -X POST 'https://content.twilio.com/v1/Content' \
-H 'Content-Type: application/json' \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
-d '{
    "friendly_name": "flight_replies",
    "language": "en",
    "variables": {"1":"name"},
    "types": {
        "twilio/quick-reply": {
                    "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?",
                    "actions": [
                        {
                            "title": "Check flight status",
                            "id": "flightid1"
                        },
                        {
                            "title": "Check gate number",
                            "id": "gateid1"
                        },
                        {
                            "title": "Speak with an agent",
                            "id": "agentid1"
                        }
                    ]
                },
        "twilio/text": {
            "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?."
        }
    }
}'

```

Response:

```json
{
  "language": "en",
  "date_updated": "2022-08-29T10:43:20Z",
  "variables": {
    "1": "name"
  },
  "friendly_name": "flight_replies",
  "account_sid": "ACXXXXXXXXXXXXXXXXXXX",
  "url": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "sid": "HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "date_created": "2022-08-29T10:43:20Z",
  "types": {
    "twilio/text": {
      "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?."
    },
    "twilio/quick-reply": {
      "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?",
      "actions": [
        {
          "id": "flightid1",
          "title": "Check flight status"
        },
        {
          "id": "gateid1",
          "title": "Check gate number"
        },
        {
          "id": "agentid1",
          "title": "Speak with an agent"
        }
      ]
    }
  },
  "links": {
    "approval_fetch": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/ApprovalRequests",
    "approval_create": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/ApprovalRequests/whatsapp"
  }
}
```

### Optional: Retrieve a Content Template SID from the Content Template Builder

You can make a `GET` request to the Content API to fetch a list of all the content templates that you have created.

#### GET API

Request:

```bash
curl -X GET "https://content.twilio.com/v1/Content?PageSize=2" \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

Response:

```json
{
  "meta": {
    "page": 0,
    "page_size": 2,
    "first_page_url": "https://content.twilio.com/v1/Content?PageSize=2&Page=0",
    "previous_page_url": null,
    "url": "https://content.twilio.com/v1/Content?PageSize=2&Page=0",
    "next_page_url": "https://content.twilio.com/v1/Content?PageSize=2&Page=1&PageToken=PAHXXXXXXXXXXXX",
    "key": "contents"
  },
  "contents": [
    {
      "language": "en",
      "date_updated": "2023-03-07T14:46:13Z",
      "variables": {
        "1": "flight_number",
        "3": "departure_time",
        "2": "arrival_city",
        "5": "url_suffix",
        "4": "gate_number"
      },
      "friendly_name": "flight_departure_update",
      "account_sid": "ACXXXXXXXXXX",
      "url": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXXX",
      "sid": "HXXXXXXXXXXXX",
      "date_created": "2023-03-07T14:46:13Z",
      "types": {
        "twilio/call-to-action": {
          "body": "Owl Air: We will see you soon! Flight {{ 1 }} to {{ 2 }} departs at {{ 3 }} from Gate {{ 4 }}.",
          "actions": [
            {
              "url": "https://owlair.com/{{ 5 }}",
              "type": "URL",
              "title": "Check Flight Status"
            },
            {
              "phone": "+18005551234",
              "type": "PHONE_NUMBER",
              "title": "Call Support"
            }
          ]
        }
      },
      "links": {
        "approval_fetch": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXX/ApprovalRequests",
        "approval_create": "https://content.twilio.com/v1/Content/HXXXXXXXXXXX/ApprovalRequests/whatsapp"
      }
    },
    {
      "language": "en",
      "date_updated": "2023-02-24T14:25:37Z",
      "variables": {
        "1": "name"
      },
      "friendly_name": "flight_replies",
      "account_sid": "ACXXXXXXXXXX",
      "url": "https://content.twilio.com/v1/Content/HXXXXXXXXXX",
      "sid": "HXXXXXXXXXXX",
      "date_created": "2023-02-24T14:25:37Z",
      "types": {
        "twilio/text": {
          "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?."
        },
        "twilio/quick-reply": {
          "body": "Hi, {{ 1 }}. \n Thanks for contacting Owl Air Support. How can I help?",
          "actions": [
            {
              "id": "flightid1",
              "title": "Check flight status"
            },
            {
              "id": "gateid1",
              "title": "Check gate number"
            },
            {
              "id": "agentid1",
              "title": "Speak with an agent"
            }
          ]
        }
      },
      "links": {
        "approval_fetch": "https://content.twilio.com/v1/Content/HXXXXXXXXXXX/ApprovalRequests",
        "approval_create": "https://content.twilio.com/v1/Content/HXXXXXXXXXXX/ApprovalRequests/whatsapp"
      }
    }
  ]
}
```

## Step 2: Create a Conversation

Now, let's create a [Conversation](/docs/conversations/api/conversation-resource) that we'll use in the next step to send a rich content message. In the sample code below, replace the Account SID and Auth Token with the values from your Twilio Console. Copy down the Conversation SID (It starts with `CHXXXXX`). We'll be using this value in the next step when we add a WhatsApp participant to the Conversation you just created.

### POST API

Request:

```bash
curl -X POST "https://conversations.twilio.com/v1/Conversations" \
--data-urlencode "FriendlyName=Send Rich content messages with Conversations" \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

Response:

```json
{
  "unique_name": null,
  "date_updated": "2023-02-13T12:31:50Z",
  "friendly_name": "Send rich content messages with Conversations",
  "timers": {},
  "account_sid": "ACXXXXXXXXXXXXX",
  "url": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXXXXX",
  "state": "active",
  "date_created": "2023-02-13T12:31:50Z",
  "messaging_service_sid": "MGXXXXXXXXXXXX",
  "sid": "CHXXXXXXXXXXXXX",
  "attributes": "{}",
  "bindings": null,
  "chat_service_sid": "ISXXXXXXXXXX",
  "links": {
    "participants": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXX/Participants",
    "messages": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXX/Messages",
    "webhooks": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXXX/Webhooks"
  }
}
```

## Step 3: Add a WhatsApp Participant to the Conversation

Let's add a WhatsApp Participant to the Conversation. For the code sample below, replace the placeholder values for:

* `CHXXXXXXX`: use the Conversation SID you just copied
* `YOUR_WHATSAPP_NUMBER`: your WhatsApp phone number, in [E.164 format](/docs/glossary/what-e164)
* `TWI_WA_NUMBER`: Your Twilio enabled WhatsApp phone number, in [E.164 format](/docs/glossary/what-e164)
* `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
* `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token

### POST API

Request:

```bash
curl -X POST "https://conversations.twilio.com/v1/Conversations/CHxxxx/Participants" \
--data-urlencode "MessagingBinding.Address=whatsapp:YOUR_WHATSAPP_NUMBER" \
--data-urlencode "MessagingBinding.ProxyAddress=whatsapp:TWI_WA_NUMBER" \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

Response:

```json
{
  "last_read_message_index": null,
  "date_updated": "2023-02-17T16:45:32Z",
  "last_read_timestamp": null,
  "conversation_sid": "CHXXXXXXXXX",
  "account_sid": "ACXXXXXXXXXX",
  "url": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXX/Participants/MBXXXXXXXXX",
  "date_created": "2023-02-17T16:45:32Z",
  "role_sid": "RLXXXXXXXXXX",
  "sid": "MBXXXXXXXXXXX",
  "attributes": "{}",
  "identity": null,
  "messaging_binding": {
    "proxy_address": "whatsapp:TWI_WA_NUMBER",
    "type": "whatsapp",
    "address": "whatsapp:YOUR_WHATSAPP_NUMBER"
  }
}
```

## Step 4: Send a Rich Message via the Conversations API

> \[!NOTE]
>
> If the customer representative wants to send rich content messages prior to
> the end user messaging them on WhatsApp, then this content template will need
> to be approved before it can be sent out. Some [content
> types](/docs/content/content-types-overview#whatsapp-approval-requirements)
> (e.g., Cards and CTA buttons) require prior approval regardless of whether the
> template is sent in the context of a session or not.

So far you've created a content template, and a Conversation with a WhatsApp participant. Now we're ready to send a rich message to the participant. This example uses the Conversations API, but content templates are also available through the [Conversations SDKs for JavaScript, Android, and iOS.](/docs/conversations/sdk-download-install)

In our `POST` request example, you'll pass the [ContentVariables parameter](/docs/content/using-variables-with-content-api) (optional), which allows you to customize the message content with dynamic values. For this example, "name" will be replaced with the value ("Alice").

Replace:

* `CHXXXXXXXXXXXXXXXXXXX` with the Conversation SID in the request URL
* `HXXXXXXXXXXXXXXXXXXXX` value in the Content SID parameter

Request parameters:

| **Parameter**    | **Required** | **Description**                                                                                                                                                             |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ContentSid       | Yes          | The unique ID of the multi-channel Content template, required for template-generated message. Note that if this field is set, the Body and MediaSid parameters are ignored. |
| ContentVariables | Optional     | A structurally valid JSON string that contains values to determine Content template variables.                                                                              |

### POST API

Request:

```bash
curl -X POST "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXXXXXXXXXXXX/Messages" \
--data-urlencode 'ContentSid=HXXXXXXXXXXXXXXXXXXXX' \
--data-urlencode 'ContentVariables={ "1": "Alice" }' \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN

```

Response:

```json
{
  "body": "Hi, Alice. \n Thanks for contacting Owl Air Support. How can I help?",
  "index": 0,
  "author": "system",
  "date_updated": "2023-02-09T17:44:30Z",
  "media": null,
  "participant_sid": null,
  "conversation_sid": "CHXXXXXXXXXXXXXXXXXXX",
  "account_sid": "ACXXXXXXXXXXXXXXXXXXX",
  "delivery": null,
  "url": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXXXXXXXXXXXX0/Messages/IMXXXXXXXXXXXXXXXXXXX",
  "date_created": "2023-02-09T17:44:30Z",
  "content_sid": "HXXXXXXXXXXXXXXXXXXXX",
  "sid": "IMXXXXXXXXXXXXXXXXXXX",
  "attributes": "{}",
  "links": {
    "delivery_receipts": "https://conversations.twilio.com/v1/Conversations/CHXXXXXXXXXXXXXXXXXXX/Messages/IMXXXXXXXXXXXXXXXXXXX/Receipts"
  }
}
```

![WhatsApp Conversation screenshot showing interactive elements in the form of buttons.](https://docs-resources.prod.twilio.com/8047361b11a80a1e251d4594f0b6471c66634d6f2324379e72f4bdac955c60bf.jpg)

Well done! You've successfully sent your first rich content message to your WhatsApp Participant using Twilio Conversations.

## What's Next?

As a following step, you can:

* Check out our [Conversations Quickstart](/docs/conversations/quickstart)
* Learn more about the [Content Template Builder](/docs/content)