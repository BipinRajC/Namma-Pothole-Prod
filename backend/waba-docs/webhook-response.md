# when user sends image:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1484705366066519",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "919108420079",
              "phone_number_id": "828706136984902"
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
                "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0EyNjY0QzIyNTg1NzQ4NzA5QjAA",
                "timestamp": "1758049216",
                "type": "image",
                "image": {
                  "mime_type": "image/jpeg",
                  "sha256": "9WR7Ly0oJemt9qwYDGYqap6jZvS45PFMEqjKXnousME=",
                  "id": "3096482900517658"
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
## Important - 
To download the image, go to the url :
`https://datads1.btpr.online/Whatsapp/LICENSE_NUBER/IMAGE_ID.jpg`


# when user sends locaiton:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1484705366066519",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "919108420079",
              "phone_number_id": "828706136984902"
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
                "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0FEMDkwMEM2MTY0NTI2Q0RFMDAA",
                "timestamp": "1758049139",
                "location": {
                  "address": "75, Gottigere, Bengaluru 560083, Karnataka, India",
                  "latitude": 12.853446006775,
                  "longitude": 77.585845947266,
                  "name": "75, Gottigere"
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
```

# When user sends normal text message:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1484705366066519",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "919108420079",
              "phone_number_id": "828706136984902"
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
                "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0FFNTFFQUY0MjAzMTRBMEZDMjMA",
                "timestamp": "1758049112",
                "text": {
                  "body": "Hi"
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
```

# When user replies to a button message:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1484705366066519",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "919108420079",
              "phone_number_id": "828706136984902"
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
                "context": {
                  "from": "919108420079",
                  "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAERgSMkY4MzZCRjkyQTI0RUY1M0FCAA=="
                },
                "from": "918610141355",
                "id": "wamid.HBgMOTE4NjEwMTQxMzU1FQIAEhgUM0FGODk3NTJDNTkxMEYxRkZFODIA",
                "timestamp": "1758051362",
                "type": "interactive",
                "interactive": {
                  "type": "button_reply",
                  "button_reply": {
                    "id": "English",
                    "title": "English"
                  }
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