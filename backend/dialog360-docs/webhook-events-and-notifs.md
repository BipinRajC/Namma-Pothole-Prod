
# Webhook Events and Notifications

## Messaging Webhooks (associated with Messaging API)

[After the webhook is set for the number](#set-webhook-url), it will receive notifications about [messaging](../waba-messaging/messaging) events. These events are grouped and can be used for:

* **Inbound Message Notifications:** Use it to get a notification when a customer performs an action, such as:

<table data-header-hidden><thead><tr><th width="374"></th><th></th></tr></thead><tbody><tr><td><ul><li>Sends a text message to the business</li><li>Sends an image, video, audio, document, or sticker to the business</li><li>Sends contact information to the business</li><li>Sends location information to the business</li><li>Clicks a reply button set up by the business</li></ul></td><td><ul><li>Clicks a call-to-actions button on an Ad that Clicks to WhatsApp</li><li>Clicks an item on a business' list</li><li>Updates their profile information such as their phone number</li><li>Asks for information about a specific product</li><li>Orders products being sold by the business</li></ul></td></tr></tbody></table>

**Message Status Notifications**: Use it to monitor the status of sent messages.

| <ul><li><code>delivered</code></li></ul> | <ul><li><code>read</code></li></ul> | <ul><li><code>sent</code></li></ul> |
| ---------------------------------------- | ----------------------------------- | ----------------------------------- |



If a webhook event isn't delivered for any reason (e.g., the client is offline) or if the webhook request returns a HTTP status code other than 200, we retry the webhook delivery. We continue retrying delivery with increasing delays up to a certain timeout (typically 24 hours, though this may vary), or until the delivery succeeds.

For Cloud API, the object is always `whatsapp_business_account` but the `field` will be indicative of the type of information being sent.

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": PHONE_NUMBER,
          "phone_number_id": PHONE_NUMBER_ID
        },
        "contacts": [{
          "profile": {
            "name": "NAME"
          },
          "wa_id": PHONE_NUMBER
        }],
        "messages": [{
          "from": PHONE_NUMBER,
          "id": "wamid.ID",
          "timestamp": TIMESTAMP,
          "text": {
            "body": "MESSAGE_BODY"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**\[will be deprecated]** For On-premise API, the object will be `contacts` and `messages`, `errors`, or `statuses` and `pricing`.

```json
{
  "contacts": [{
    "profile": {
      "name": "NAME"
    },
    "wa_id": "WHATSAPP_BUSINESS_ACCOUNT_ID"
  }],
  "messages":[{
    "from": "PHONE_NUMBER",
    "id": "wamid.ID",
    "timestamp": "TIMESTAMP",
    "text": {
      "body": "MESSAGE_BODY"
    },
    "type": "text"
  }]
} 
```

### Text Messages <a href="#text-messages" id="text-messages"></a>

See[ Text Messages.](../../waba-messaging/messaging#send-text-messages)

The following is an example of a text message you received from a customer:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": PHONE_NUMBER,
                  "phone_number_id": PHONE_NUMBER_ID
              },
              "contacts": [{
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": PHONE_NUMBER
                }],
              "messages": [{
                  "from": PHONE_NUMBER,
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "text": {
                    "body": "MESSAGE_BODY"
                  },
                  "type": "text"
                }]
          },
          "field": "messages"
        }]
  }]
}
```

</details>

### Reaction Messages <a href="#reaction-messages" id="reaction-messages"></a>

See [Reaction Messages](../../waba-messaging/interactive-messages#reaction-messages).

The following is an example of a reaction message you received from a customer. You will not receive this webbook if the message the customer is reacting to is more than 30 days old.

<details>

<summary>Example Payload</summary>

<pre class="language-json"><code class="lang-json"><strong>{
</strong>"object": "whatsapp_business_account",
"entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
        "value": {
            "messaging_product": "whatsapp",
            "metadata": {
                "display_phone_number": PHONE_NUMBER,
                "phone_number_id": PHONE_NUMBER_ID
            },
            "contacts": [{
                "profile": {
                  "name": "NAME"
                },
                "wa_id": PHONE_NUMBER
              }],
            "messages": [{
                "from": PHONE_NUMBER,
                "id": "wamid.ID",
                "timestamp": TIMESTAMP,
                "reaction": {
                  "message_id": "MESSAGE_ID",
                  "emoji": "EMOJI"
                },
                "type": "reaction"
              }]
        },
        "field": "messages"
      }]
}]
}
</code></pre>

</details>

Note that for reactions, the `timestamp` value indicates when the customer sent the reaction, not when the webhook was generated.

### Media Messages <a href="#media-messages" id="media-messages"></a>

See [Media Messages](../waba-messaging/media).

When a message with media is received, the WhatsApp Business Platform downloads the media. A notification is sent to the Webhook once the media is downloaded.

The Webhook notification contains information that identifies the media object and enables you to find and retrieve the object. [Use the media endpoints to retrieve the media](../waba-messaging/media/upload-retrieve-or-delete-media).

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": PHONE_NUMBER,
                  "phone_number_id": PHONE_NUMBER_ID
              },
              "contacts": [{
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "WHATSAPP_ID"
                }],
              "messages": [{
                  "from": PHONE_NUMBER,
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "type": "image",
                  "image": {
                    "caption": "CAPTION",
                    "mime_type": "image/jpeg",
                    "sha256": "IMAGE_HASH",
                    "id": "ID"
                  }
                }]
          },
          "field": "messages"
        }]
    }]
}
```





When you receive a sticker, you will get the following notification:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "NAME"
                },
                "wa_id": "ID"
              }
            ],
            "messages": [
              {
                "from": "SENDER_PHONE_NUMBER",
                "id": "wamid.ID",
                "timestamp": "TIMESTAMP",
                "type": "sticker",
                "sticker": {
                  "mime_type": "image/webp",
                  "sha256": "HASH",
                  "id": "ID"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Unknown Messages <a href="#unknown-messages" id="unknown-messages"></a>

It's possible to receive an unknown message callback notification. For example, a customer could send you a message that's not supported, such as a disappearing message (in which case Meta notifies the that the message type is not supported).

<details>

<summary>Example Payload</summary>

The following is an example of a message you received from a customer that is not supported.

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": { 
                "display_phone_number": "PHONE_NUMBER", 
                "phone_number_id": "PHONE_NUMBER_ID" 
              },
              "contacts": [{
                  "profile": { 
                    "name": "NAME" 
                  }, 
                  "wa_id": "WHATSAPP_ID"
                }],
              "messages": [{
                  "from": "PHONE_NUMBER",
                  "id": "wamid.ID", 
                  "timestamp": "TIMESTAMP",
                  "errors": [ 
                    { 
                      "code": 131051, 
                      "details": "Message type is not currently supported",
                      "title": "Unsupported message type"
                    }],
                   "type": "unknown"
                   }]
            }
            "field": "messages"
        }],
    }]
}
```

</details>

### Location Messages <a href="#location-messages" id="location-messages"></a>

See[ Location Messages](../../waba-messaging/contacts-and-location-messages#sending-location-messages).

The following is an example of a location message you received from a customer:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": "PHONE_NUMBER",
                  "phone_number_id": "PHONE_NUMBER_ID"
              },
              "contacts": [{
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "WHATSAPP_ID"
                }],
              "messages": [{
                  "from": "PHONE_NUMBER",
                  "id": "wamid.ID",
                  "timestamp": "TIMESTAMP",
                 "location": {
                    "latitude": LOCATION_LATITUDE,
                    "longitude": LOCATION_LONGITUDE,
                    "name": LOCATION_NAME,
                    "address": LOCATION_ADDRESS,
                 }
                }]
          },
          "field": "messages"
        }]
    }]
}
```

</details>

### Contacts Messages <a href="#contacts-messages" id="contacts-messages"></a>

See [Contacts Messages](../waba-messaging/contacts-and-location-messages).

The following is an example of a contact message you received from a customer:

<details>

<summary>Example Payload</summary>

```json
{
  "object":"whatsapp_business_account",
  "entry":[{
    "id":"WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes":[{
      "value":{
        "messaging_product":"whatsapp",
        "metadata": {
          "display_phone_number":"PHONE_NUMBER",
          "phone_number_id":"PHONE_NUMBER_ID"
          },
        "contacts": [{
          "profile":{
            "name":"NAME"
            },
          "wa_id":"WHATSAPP_ID"
          }],
        "messages":[{
          "from":"PHONE_NUMBER",
          "id":"wamid.ID",
          "timestamp":"TIMESTAMP",
          "contacts":[{
            "addresses":[{
              "city":"CONTACT_CITY",
              "country":"CONTACT_COUNTRY",
              "country_code":"CONTACT_COUNTRY_CODE",
              "state":"CONTACT_STATE",
              "street":"CONTACT_STREET",
              "type":"HOME or WORK",
              "zip":"CONTACT_ZIP"
            }],
            "birthday":"CONTACT_BIRTHDAY",
            "emails":[{
              "email":"CONTACT_EMAIL",
              "type":"WORK or HOME"
              }],
            "name":{
              "formatted_name":"CONTACT_FORMATTED_NAME",
              "first_name":"CONTACT_FIRST_NAME",
              "last_name":"CONTACT_LAST_NAME",
              "middle_name":"CONTACT_MIDDLE_NAME",
              "suffix":"CONTACT_SUFFIX",
              "prefix":"CONTACT_PREFIX"
              },
            "org":{
              "company":"CONTACT_ORG_COMPANY",
              "department":"CONTACT_ORG_DEPARTMENT",
              "title":"CONTACT_ORG_TITLE"
              },
            "phones":[{
              "phone":"CONTACT_PHONE",
              "wa_id":"CONTACT_WA_ID",
              "type":"HOME or WORK>"
              }],
            "urls":[{
              "url":"CONTACT_URL",
              "type":"HOME or WORK"
              }]
            }]
          }]
        },
      "field":"messages"
    }]
  }]
}
```

</details>

### Received Callback from a Quick Reply Button <a href="#received-callback-from-a-quick-reply-button" id="received-callback-from-a-quick-reply-button"></a>

See [Interactive Messages.](../waba-messaging/interactive-messages)

When your customer clicks on a quick reply button in an [interactive message template](../waba-messaging/interactive-messages), a response is sent. Below is an example of the callback format.

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": PHONE_NUMBER,
                  "phone_number_id": PHONE_NUMBER_ID
              },
              "contacts": [{
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "WHATSAPP_ID"
                }],
              "messages": [{
                  "context": {
                    "from": PHONE_NUMBER,
                    "id": "wamid.ID"
                  },
                  "from": "16315551234",
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "type": "button",
                  "button": {
                    "text": "No",
                    "payload": "No-Button-Payload"
                  }
                }]
          },
          "field": "messages"
        }]
    }]
}
```

</details>

### Received Answer From List Message <a href="#list-messages" id="list-messages"></a>

See [Interactive Messages.](../waba-messaging/interactive-messages)

The following webhook notification is received when a user clicks on an item from a list message you sent:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                   "display_phone_number": "PHONE_NUMBER",
                   "phone_number_id": "PHONE_NUMBER_ID",
              },
              "contacts": [
                {
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "PHONE_NUMBER_ID"
                }
              ],
              "messages": [
                {
                  "from": PHONE_NUMBER_ID,
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "interactive": {
                    "list_reply": {
                      "id": "list_reply_id",
                      "title": "list_reply_title",
                      "description": "list_reply_description"
                    },
                    "type": "list_reply"
                  },
                  "type": "interactive"
                }
              ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Received Answer to Reply Button <a href="#reply-button" id="reply-button"></a>

See [Interactive Messages.](../waba-messaging/interactive-messages)

The following webhook notification is received when a user clicks on a reply button you sent:

<details>

<summary>Example Payload</summary>

<pre class="language-json"><code class="lang-json"><strong>{
</strong>  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                   "display_phone_number": "PHONE_NUMBER",
                   "phone_number_id": PHONE_NUMBER_ID,
              },
              "contacts": [
                {
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "PHONE_NUMBER_ID"
                }
              ],
              "messages": [
                {
                  "from": PHONE_NUMBER_ID,
                  "id": "wamid.ID",
                  "timestamp": TIMESTAMP,
                  "interactive": {
                    "button_reply": {
                      "id": "unique-button-identifier-here",
                      "title": "button-text",
                    },
                    "type": "button_reply"
                  },
                  "type": "interactive"
                }
              ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
</code></pre>

</details>

### Received Message Triggered by Click to WhatsApp Ads <a href="#received-message-triggered-by-click-to-whatsapp-a-ds" id="received-message-triggered-by-click-to-whatsapp-a-ds"></a>

You get the following webhook when a conversation is started after a user clicks an ad with a Click to WhatsApp’s call-to-action:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "NAME"
                },
                "wa_id": "ID"
              }
            ],
            "messages": [
              {
                "referral": {
                  "source_url": "AD_OR_POST_FB_URL",
                  "source_id": "ADID",
                  "source_type": "ad or post",
                  "headline": "AD_TITLE",
                  "body": "AD_DESCRIPTION",
                  "media_type": "image or video",
                  "image_url": "RAW_IMAGE_URL",
                  "video_url": "RAW_VIDEO_URL",
                  "thumbnail_url": "RAW_THUMBNAIL_URL",
                  "ctwa_clid": "CTWA_CLID"
                },
                "from": "SENDER_PHONE_NUMBERID",
                "id": "wamid.ID",
                "timestamp": "TIMESTAMP",
                "type": "text",
                "text": {
                  "body": "BODY"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Flow completed <a href="#product-inquiry-messages" id="product-inquiry-messages"></a>

When the user completes the flow, a message is sent to WhatsApp chat. You will receive that message through a webhook which you normally use to process chat messages from the user.&#x20;

<details>

<summary>Example Payload</summary>

```json
{
  "messages": [{
    "context": {
      "from": "16315558151",
      "id": "gBGGEiRVVgBPAgm7FUgc73noXjo"
    },
    "from": "<USER_ACCOUNT_NUMBER>",
    "id": "<MESSAGE_ID>",
    "type": "interactive",
    "interactive": {
      "type": "nfm_reply",
      "nfm_reply": {
        "name": "flow",
        "response_json": {
            "flow_token": "<FLOW_TOKEN>", 
            "optional_param1": "<value1>",
            "optional_param2": "<value2>"
        }
      }
    },
    "timestamp": "<MESSAGE_SEND_TIMESTAMP>"
  }]
}
```

</details>

### Request\_message

See [Conversational Components](../waba-messaging/conversational-components).

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "<BUSINESS_DISPLAY_PHONE_NUMBER>",
              "phone_number_id": "<BUSINESS_PHONE_NUMBER_ID>"
            },
            "contacts": [
              {
                "profile": {
                  "name": "<WHATSAPP_USER_NAME>"
                },
                "wa_id": "<WHATSAPP_USER_ID>"
              }
            ],
            "messages": [
              {
                "from": "<WHATSAPP_USER_PHONE_NUMBER>",
                "id": "<WHATSAPP_MESSAGE_ID>",
                "timestamp": "<TIMESTAMP>",
                "type": "request_welcome"  // Indicates first time message from WhatsApp user
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Product Inquiry Messages <a href="#product-inquiry-messages" id="product-inquiry-messages"></a>

A Product Inquiry Message is received when a customer asks for more information about a product. These can happen when:

* a customer replies to [Single or Multi-Product Messages](../waba-messaging/interactive-messages/single-and-multi-product-messages), or
* a customer accesses a business's catalog via another entry point, navigates to a **Product Details** page, and clicks **Message Business about this Product**.

A webhooks notification for a Product Inquiry Message looks like this:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "ID",
      "changes": [
        {
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                   "display_phone_number": "PHONE_NUMBER",
                   "phone_number_id": "PHONE_NUMBER_ID",
              },
              "contacts": [
                {
                  "profile": {
                    "name": "NAME"
                  },
                  "wa_id": "PHONE_NUMBER_ID"
                }
              ],
              "messages": [
                {
                  "from": "PHONE_NUMBER",
                  "id": "wamid.ID",
                  "text": {
                    "body": "MESSAGE_TEXT"
                  },
                  "context": {
                    "from": "PHONE_NUMBER",
                    "id": "wamid.ID",
                    "referred_product": {
                      "catalog_id": "CATALOG_ID",
                      "product_retailer_id": "PRODUCT_ID"
                    }
                  },
                  "timestamp": "TIMESTAMP",
                  "type": "text"
                }
              ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Order Messages <a href="#order-messages" id="order-messages"></a>

See [Order Details Template Messages](../waba-messaging/payments-india-only/order-details-template-message)

A webhooks notification for when a customer places an order looks like this:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "8856996819413533",
      "changes": [
        {
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                   "display_phone_number": "16505553333",
                   "phone_number_id": "phone-number-id",
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Kerry Fisher"
                  },
                  "wa_id": "16315551234"
                }
              ],
              "messages": [
                {
                  "from": "16315551234",
                  "id": "wamid.ABGGFlCGg0cvAgo6cHbBhfK5760V",
                  "order": {
                    "catalog_id": "the-catalog_id",
                    "product_items": [
                      {
                        "product_retailer_id":"the-product-SKU-identifier",
                        "quantity":"number-of-item",
                        "item_price":"unitary-price-of-item",
                        "currency":"price-currency"
                      },
                      ...
                    ],
                    "text":"text-message-sent-along-with-the-order"
                  },
                  "context": {
                    "from": "16315551234",
                    "id": "wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o"
                  },
                  "timestamp": "1603069091",
                  "type": "order"
                }
              ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### User Changed Number Notification <a href="#user-changed-number-notification" id="user-changed-number-notification"></a>

When a user changes their phone number on WhatsApp, you receive a system message notification:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
          "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                  "display_phone_number": PHONE_NUMBER,
                  "phone_number_id": PHONE_NUMBER_ID
              },
              "messages": [{
                  "from": PHONE_NUMBER,
                  "id": "wamid.ID",
                  "system": {
                    "body": "NAME changed from PHONE_NUMBER to PHONE_NUMBER",
                    "new_wa_id": NEW_PHONE_NUMBER,
                    "type": "user_changed_number"
                  },
                  "timestamp": TIMESTAMP,
                  "type": "system"
                }]
          },
          "field": "messages"
        }]
    }]
}
```

</details>

### Template held for Pacing&#x20;

<details>

<summary><strong>Example Payload</strong> </summary>

Messages will have one of the following statuses which will be returned in each of the `messages` objects

* `"message_status":`**`"accepted"`** : means the message was sent to the intended recipient.
* `"message_status":`**`"held_for_quality_assessment"`**: means the message send was delayed until quality can be validated and it will either be sent or dropped at this point.

```json
      {
      "messaging_product": "whatsapp",
      "contacts": [
        {
          "input": "16505555555",
          "wa_id": "16505555555"
        }
      ],
      "messages": [
        {
          "id": "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA",
          "message_status": "Message has been held because quality assessment is pending",
          //"message_status": "accepted",
        }
      ]
    }
```

</details>



## Message Status Updates <a href="#message-status-updates" id="message-status-updates"></a>

The [Messaging webhook ](../waba-messaging/webhook)receives an event when the message is sent, delivered, and read.&#x20;

The order of these events may not reflect the actual timing of the message status. View the timestamp to determine the timing, if necessary.

### Status: Message Sent <a href="#status--message-sent" id="status--message-sent"></a>

The following notification is received when a business sends a message as part of a [user-initiated conversation](../waba-messaging/per-message-pricing) (if that conversation did not originate in a free entry point):

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
    "value": {
    "messaging_product": "whatsapp",
    "metadata": {
      "display_phone_number": "PHONE_NUMBER",
      "phone_number_id": "PHONE_NUMBER_ID"
      },
    "statuses": [{
      "id": "wamid.ID",
      "status": "sent",
      "timestamp": TIMESTAMP,
      "recipient_id": PHONE_NUMBER,
      "conversation": {
        "id": "CONVERSATION_ID",
        "expiration_timestamp": TIMESTAMP,
        "origin": {
          "type": "referral_conversion"
          }
      },
      "pricing": {
        "billable": false,
        "pricing_model": "CBP",
        "category": "referral_conversion"
        }
     }]
    },
    "field": "messages"
   }]
 }]
}
```

</details>

The following notification is received when a business sends a message in reply to a [user-initiated conversation ](../waba-messaging/per-message-pricing)originating from [free entry points](../../waba-messaging/per-message-pricing#free-entry-points):

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
    "value": {
    "messaging_product": "whatsapp",
    "metadata": {
      "display_phone_number": "PHONE_NUMBER",
      "phone_number_id": "PHONE_NUMBER_ID"
      },
    "statuses": [{
      "id": "wamid.ID",
      "recipient_id": "PHONE_NUMBER",
      "status": "sent",
      "timestamp": "TIMESTAMP",
      "conversation": {
        "id": "CONVERSATION_ID",
        "expiration_timestamp": TIMESTAMP,
        "origin": {
          "type": "business_initated"
          }
        },
      "pricing": {
        "pricing_model": "CBP",
        "billable": true,
        "category": "business_initated"
        }
      }] 
    },
    "field": "messages"
    }]
 }]
}
```

</details>

The following notification is received when a business sends a message as part of [a business-initiated conversation](../waba-messaging/per-message-pricing):

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "BUSINESS_DISPLAY_PHONE_NUMBER",
              "phone_number_id": "BUSINESS_PHONE_NUMBER_ID"
            },
            "statuses": [
              {
                "id": "WHATSAPP_MESSAGE_ID",
                "status": "sent",
                "timestamp": "TIMESTAMP",
                "recipient_id": "CUSTOMER_PHONE_NUMBER",
                "conversation": {
                  "id": "CONVERSATION_ID",
                  "expiration_timestamp": "CONVERSATION_EXPIRATION_TIMESTAMP",
                  "origin": {
                    "type": "user_initiated"
                  }
                },
                "pricing": {
                  "billable": true,
                  "pricing_model": "CBP",
                  "category": "service"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Status: Message Delivered

The following notification is received when a business’ message is delivered and that message is part of a [user-initiated conversation](../waba-messaging/per-message-pricing) (if that conversation did not originate in a [free entry point](../../waba-messaging/per-message-pricing#free-entry-points)):

<details>

<summary>Example Payload</summary>

```reason
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
    "value": {
    "messaging_product": "whatsapp",
    "metadata": {
      "display_phone_number": "PHONE_NUMBER",
      "phone_number_id": "PHONE_NUMBER_ID"
      },
    "statuses": [{
      "id": "wamid.ID",
      "recipient_id": "PHONE_NUMBER",
      "status": "delivered",
      "timestamp": "TIMESTAMP",
      "conversation": {
        "id": "CONVERSATION_ID",
        "expiration_timestamp": TIMESTAMP,
        "origin": {
          "type": "user_initiated"
         }
        },
      "pricing": {
        "pricing_model": "CBP",
        "billable": true,
        "category": "service"
        }
      }]
     },
    "field": "messages"
  }]
 }]

```

</details>

The following notification is received when a business’ message is delivered and that message is part of a [business-initiated conversation](../waba-messaging/per-message-pricing):

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
    "value": {
    "messaging_product": "whatsapp",
    "metadata": {
      "display_phone_number": "PHONE_NUMBER",
      "phone_number_id": "PHONE_NUMBER_ID"
      },
    "statuses": [{
      "id": "wamid.ID",
      "recipient_id": "PHONE_NUMBER",
      "status": "delivered",
      "timestamp": "TIMESTAMP",
      "conversation": {
        "id": "CONVERSATION_ID",
        "expiration_timestamp": TIMESTAMP,
        "origin": {
          "type": "business_initiated"
        }
      },
      "pricing": {
        "pricing_model": "CBP",
        "billable": true,
        "category":"business-initiated"
      }
    }]
    },
    "field": "messages"
  }]
 }]
}
```

</details>

The following notification is received when a business’ message is delivered and that message is part of a [user-initiated conversation ](../waba-messaging/per-message-pricing)originating from a [free entry point](../../waba-messaging/per-message-pricing#free-entry-points):

<details>

<summary>Example Payload</summary>

<pre class="language-json"><code class="lang-json"><strong>{
</strong>  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
    "value": {
    "messaging_product": "whatsapp",
    "metadata": {
      "display_phone_number": "PHONE_NUMBER",
      "phone_number_id": "PHONE_NUMBER_ID"
      },
    "statuses": [{
      "id": "wamid.ID",
      "status": "sent",
      "timestamp": "TIMESTAMP",
      "recipient_id": "PHONE_NUMBER",
      "conversation": {
        "id": "CONVERSATION_ID",
        "expiration_timestamp": TIMESTAMP,
        "origin" {
          "type": "referral_conversion"
          }
        },
      "pricing": {
        "billable": false,
        "pricing_model": "CBP",
        "category": "referral_conversion"
      }
    }]
    },
    "field": "messages"
  }]
 }]
}
</code></pre>

</details>

### Status: Message Read <a href="#status--message-read" id="status--message-read"></a>

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "BUSINESS_DISPLAY_PHONE_NUMBER",
              "phone_number_id": "BUSINESS_PHONE_NUMBER_ID"
            },
            "statuses": [
              {
                "id": "WHATSAPP_MESSAGE_ID",
                "status": "read",
                "timestamp": "TIMESTAMP",
                "recipient_id": "CUSTOMER_PHONE_NUMBER"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Status: Message Deleted <a href="#status--message-deleted" id="status--message-deleted"></a>

Currently, the Cloud API does not support webhook status updates for deleted messages. If a user deletes a message, you will receive a webhook with an error code for an unsupported message type:

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
      "messaging_product": "whatsapp",
      "metadata": {
        "display_phone_number": PHONE_NUMBER,
        "phone_number_id": PHONE_NUMBER
      },
      "contacts": [{
        "profile": {
          "name": "NAME"
          },
        "wa_id": PHONE_NUMBER
        }],
    "messages": [{
      "from": PHONE_NUMBER,
      "id": "wamid.ID",
      "timestamp": TIMESTAMP,
      "errors": [{
        "code": 131051,
        "details": "Message type is not currently supported",
        "title": "Unsupported message type"
        }],
      "type": "unsupported"
      }]
    },
    "field": "messages"
    }]
  }]
}
```

</details>

Please note that there are other user behaviors that can trigger this same error message. See [Error Messages](../support/api-error-message-list).&#x20;

### Status: Message Failed <a href="#status--message-failed" id="status--message-failed"></a>

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "<WHATSAPP_BUSINESS_ACCOUNT_ID>",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550783881",
              "phone_number_id": "106540352242922"
            },
            "statuses": [
              {
                "id": "wamid.HBgLMTIxMTU1NTc5NDcVAgARGBIyRkQxREUxRDJFQUJGMkQ3NDIA",
                "status": "failed",
                "timestamp": "1689380458",
                "recipient_id": "15551234567",
                "errors": [
                  {
                    "code": 131014,
                    "title": "Request for url https://URL.jpg failed with error: 404 (Not Found)"
                  }
                ]
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>

### Status: Message Undeliverable (Experiments) <a href="#status--message-undeliverable" id="status--message-undeliverable"></a>

See [Experiments in Marketing Messages.](../../waba-messaging/per-message-pricing#experiments)&#x20;

<details>

<summary>Example Payload</summary>

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "102290129340398 ",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550783881",
              "phone_number_id": "106540352242922"
            },
            "statuses": [
              {
                "id": "wamid.HBgLMTIxMTU1NTc5NDcVAgARGBIyRkQxREUxRDJFQUJGMkQ3NDIA",
                "status": "failed",
                "timestamp": "1689380458",
                "recipient_id": "15551234567",
                "errors": [
                  {
                    "code": 130472,
                    "title": "User's number is part of an experiment",
                    "message": "User's number is part of an experiment",
                    "error_data": {
                      "details": "Failed to send message because this user's phone number is part of an experiment"
                    },
                    "href": "https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/"
                  }
                ]
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

</details>