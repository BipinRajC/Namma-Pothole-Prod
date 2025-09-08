
# Interactive messages

{% hint style="info" %}
You can only send an interactive message up until 24 hours after receiving a message from the user. If you have not received a message from the user within this time, you will need to start a new conversation by [sending a Template message.](../template-messages/sending-template-messages)
{% endhint %}

Interactive messages contain buttons, menus, or custom actions that invite **users to interact with the business besides only typing texts**.&#x20;

They achieve significantly **higher response rates and conversions** compared to text-based messages.

The following messages are considered interactive:



* **List Messages**: Messages including a menu of up to 10 options. This type of message offers a simpler and more consistent way for users to make a selection when interacting with a business.
* **Reply Buttons**: Messages including up to 3 options —each option is a button. This type of message offers a quicker way for users to make a selection from a menu when interacting with a business. Reply buttons have the same user experience as interactive templates with buttons.
* **Reaction Messages:** Reaction Messages allow you to react to messages. This feature is available in the Cloud API.
* **Single Product Message**: Messages with a Single Product item from the business’ inventory. See[ Products and Catalogs](../../commerce-and-payments/products-and-catalogs) for more information.
* **Multi-Product Message**: Messages containing a selection of up to 30 items from a business’ inventory. See[ Products and Catalogs](../../commerce-and-payments/products-and-catalogs) for more information.
* **Location Request Messages**: Location request messages contain body text and a Send location button that users can tap. Tapping the button displays a location sharing screen which the user can then use to share their location. See [Location Request Messages](interactive-messages/location-request-messages).

{% hint style="info" %}
Businesses from India need to comply with extra rules to use product messages. [See them here](../../commerce-and-payments/products-and-catalogs/india-businesses-compliance-for-commerce).
{% endhint %}

## Interactive Message Specifications

* Interactive messages can be combined together in the same flow.
* Users cannot select more than one option at the same time from a list or button message, but they can go back and re-open a previous message.
* List or reply button messages cannot be used as notifications. Currently, they can only be sent within 24 hours of the last message sent by the user. If you try to send a message outside the 24-hour window, you get an error message.
* Supported platforms: iOS, Android, and web.

See how text messages compare to interactive messages:

<figure><img src="https://2248475362-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FuyAl2S0lSHJaNDXJHo7A%2Fuploads%2FZKIlxn5jjT1kGMJ3iYFe%2FScreen%20Shot%202022-09-05%20at%2015.38.26.png?alt=media&#x26;token=08eda6bb-bac9-4305-84d1-f0e19471c391" alt=""><figcaption></figcaption></figure>

## Sending Interactive Messages

Interactive messages include List Messages and Reply Buttons.

To send interactive messages, make a `POST` call to `/messages` and attach a message object with `type=interactive`. Then, add an [`interactive` object.](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-object)

**List Messages** sample request:

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "PHONE_NUMBER",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "HEADER_TEXT"
    },
    "body": {
      "text": "BODY_TEXT"
    },
    "footer": {
      "text": "FOOTER_TEXT"
    },
    "action": {
      "button": "BUTTON_TEXT",
      "sections": [
        {
          "title": "SECTION_1_TITLE",
          "rows": [
            {
              "id": "SECTION_1_ROW_1_ID",
              "title": "SECTION_1_ROW_1_TITLE",
              "description": "SECTION_1_ROW_1_DESCRIPTION"
            },
            {
              "id": "SECTION_1_ROW_2_ID",
              "title": "SECTION_1_ROW_2_TITLE",
              "description": "SECTION_1_ROW_2_DESCRIPTION"
            }
          ]
        },
        {
          "title": "SECTION_2_TITLE",
          "rows": [
            {
              "id": "SECTION_2_ROW_1_ID",
              "title": "SECTION_2_ROW_1_TITLE",
              "description": "SECTION_2_ROW_1_DESCRIPTION"
            },
            {
              "id": "SECTION_2_ROW_2_ID",
              "title": "SECTION_2_ROW_2_TITLE",
              "description": "SECTION_2_ROW_2_DESCRIPTION"
            }
          ]
        }
      ]
    }
  }
}
```

**Reply Button** sample request:

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "PHONE_NUMBER",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "BUTTON_TEXT"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "UNIQUE_BUTTON_ID_1",
            "title": "BUTTON_TITLE_1"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "UNIQUE_BUTTON_ID_2",
            "title": "BUTTON_TITLE_2"
          }
        }
      ]
    }
  }
```

A successful response includes an object with an identifier prefixed with `wamid`. Use the ID listed after `wamid` to track your message status.

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "PHONE_NUMBER",
      "wa_id": "WHATSAPP_ID",
    }]
  "messages": [{
      "id": "wamid.ID",
    }]
}
```



## **Reaction Messages**

Reaction Messages allow you to react to messages. This feature is currently available in the Cloud API. There is no information regarding an estimated time of availability or whether it will be introduced in the on-premises API.

#### Reaction Object <a href="#reaction-object" id="reaction-object"></a>

| Name                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p><code>message_id</code></p><p><em>string</em></p> | <p><strong>Required</strong>.</p><p>The WhatsApp Message ID (wamid) of the message on which the reaction should appear. The reaction will not be sent if:</p><ul><li>The message is older than 30 days</li><li>The message is a reaction message</li><li>The message has been deleted</li></ul><p>If the ID is of a message that has been deleted, the message will not be delivered.</p>                        |
| <p><code>emoji</code></p><p><em>string</em></p>      | <p><strong>Required</strong>.</p><p>Emoji to appear on the message.</p><ul><li>All emojis supported by Android and iOS devices are supported.</li><li>Rendered-emojis are supported.</li><li>If using emoji unicode values, values must be Java- or JavaScript-escape encoded.</li><li>Only one emoji can be sent in a reaction message</li><li>Use an empty string to remove a previously sent emoji.</li></ul> |

To send reaction messages, make a `POST` call to `/messages` and attach a `message` object with `type=reaction`. Then, add a `reaction` object.

Sample request:

```json
 {
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "PHONE_NUMBER",
  "type": "reaction",
  "reaction": {
    "message_id": "wamid.HBgLM...",
    "emoji": "\uD83D\uDE00"
  }
}
```

If the message you are reacting to is more than 30 days old, doesn't correspond to any message in the conversation, has been deleted, or is itself a reaction message, the reaction message will not be delivered and you will receive a webhook with the code `131009`. See[ Cloud API Error Codes](../../../support/error-messages#cloud-api-error-codes).

A successful response includes an object with an identifier prefixed with `wamid`. Use the `ID` listed after `wamid` to track your message status.

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
      "input": "PHONE_NUMBER",
      "wa_id": "WHATSAPP_ID",
    }]
  "messages": [{
      "id": "wamid.ID",
    }]
}
```
