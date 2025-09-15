# General Syntax of Response
```json
{
    "contact": {
        "status": "existing/updated/new",
        "phone_number": "XXXXXXXXXX",
        "uid": "XXXXXXXXXX",
        "first_name": "XXXXXXXXXX",
        "last_name": "XXXXXXXXXX",
        "email": "XXXXXX@XXXXXXXXXX.com",
        "language_code": "en",
        "country": "XXXX"
    },
      "message": {
        "whatsapp_business_phone_number_id": "XXXXXXXXXX",
        "whatsapp_message_id": "wamid.XXXXXXXXXX",
        "replied_to_whatsapp_message_id": "wamid.XXXXXXXXXX",
        "is_new_message": true,
        "body": null,
        "status": null,
        "media": {
          "type": "image",
          "link": "link to media",
          "caption": null,
          "mime_type": "image/jpeg",
          "file_name": "XXXXXXXXXX",
          "original_filename": "XXXXXXXXXX"
        }
      },
    "whatsapp_webhook_payload": {
        // WhatsApp webhook data
    }
}
```

# Example Response for Normal Text Message
```json
{
  "contact": {
    "status": "existing",
    "phone_number": "919108012371",
    "uid": "edeb32ee-c2da-41eb-b094-016196d89ae0",
    "first_name": "Amol",
    "last_name": "  Vyas",
    "email": "",
    "language_code": "",
    "country": null
  },
  "message": {
    "whatsapp_business_phone_number_id": "694623017079100",
    "whatsapp_message_id": "wamid.HBgMOTE5MTA4MDEyMzcxFQIAEhggQUNBNTMxQkI4MkY2QTUxMzkyMDkzODQ0MjFGMzU4QjMA",
    "replied_to_whatsapp_message_id": null,
    "is_new_message": true,
    "body": "Hola",
    "status": null,
    "media": []
  },
  "whatsapp_webhook_payload": {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "1462710811595099",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "15558972701",
                "phone_number_id": "694623017079100"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Amol Vyas"
                  },
                  "wa_id": "919108012371"
                }
              ],
              "messages": [
                {
                  "from": "919108012371",
                  "id": "wamid.HBgMOTE5MTA4MDEyMzcxFQIAEhggQUNBNTMxQkI4MkY2QTUxMzkyMDkzODQ0MjFGMzU4QjMA",
                  "timestamp": "1757763111",
                  "text": {
                    "body": "Hola"
                  },
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
}
```

# Example Response when sending Image:
```json
{
  "contact": {
    "status": "existing",
    "phone_number": "917676795199",
    "uid": "e29204aa-1e63-45db-bb95-bbcbf14c75c4",
    "first_name": "Test",
    "last_name": "Contact",
    "email": null,
    "language_code": null,
    "country": null
  },
  "message": {
    "whatsapp_business_phone_number_id": "694623017079100",
    "whatsapp_message_id": "wamid.HBgMOTE3Njc2Nzk1MTk5FQIAEhgUM0E1MkRDNENCQjU1QjU2OEY1QkYA",
    "replied_to_whatsapp_message_id": null,
    "is_new_message": true,
    "body": null,
    "status": null,
    "media": {
      "type": "image",
      "link": "https://wapi.in.net/media-storage/vendors/7634c63c-352a-4e2c-a7f4-69c2e0197d5c/whatsapp_media/images/68c55a0087bfb.jpg",
      "caption": null,
      "mime_type": "image/jpeg",
      "file_name": "68c55a0087bfb.jpg",
      "original_filename": "68c55a0087bfb.jpg"
    }
  },
  "whatsapp_webhook_payload": {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "1462710811595099",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "15558972701",
                "phone_number_id": "694623017079100"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Bipin Raj"
                  },
                  "wa_id": "917676795199"
                }
              ],
              "messages": [
                {
                  "from": "917676795199",
                  "id": "wamid.HBgMOTE3Njc2Nzk1MTk5FQIAEhgUM0E1MkRDNENCQjU1QjU2OEY1QkYA",
                  "timestamp": "1757764091",
                  "type": "image",
                  "image": {
                    "mime_type": "image/jpeg",
                    "sha256": "zkUec2P30uN4JQP8uoxQGQOL5OKColMt7sn83a7gjOU=",
                    "id": "1501466634315331"
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
}
```

# Exaple Response when sending location:
```json
{
  "contact": {
    "status": "existing",
    "phone_number": "918610141355",
    "uid": "cc7fa137-d8a2-4158-97be-cf46e0cd2b43",
    "first_name": "sravan",
    "last_name": "  karthik t",
    "email": null,
    "language_code": null,
    "country": null
  },
  "message": {
    "whatsapp_business_phone_number_id": "694623017079100",
    "whatsapp_message_id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0FBQjdFOUQxRjlBRTJGMkE4MjgA",
    "replied_to_whatsapp_message_id": null,
    "is_new_message": true,
    "body": null,
    "status": null,
    "media": []
  },
  "whatsapp_webhook_payload": {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "1462710811595099",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "15558972701",
                "phone_number_id": "694623017079100"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "sravan karthik t"
                  },
                  "wa_id": "918610141355"
                }
              ],
              "messages": [
                {
                  "from": "918610141355",
                  "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0FBQjdFOUQxRjlBRTJGMkE4MjgA",
                  "timestamp": "1757764052",
                  "location": {
                    "address": "63 13th Cross, Hulimaavu, Bengaluru, 560076, KA, IN",
                    "latitude": 12.875993728638,
                    "longitude": 77.595741271973,
                    "name": "Royal Meenakshi Mall",
                    "url": "http://royalmeenakshimall.com/"
                  },
                  "type": "location"
                }
              ]
            },
            "field": "messages"
          }
        ]
      }
    ]
  }
}
```