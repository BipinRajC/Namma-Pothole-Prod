# Basic Information:

- apiBaseUrl: `https://wapi.in.net/api`
- vendorUid:
`7634c63c-352a-4e2c-a7f4-69c2e0197d5c`
- phoneNumberId: `694623017079100`

# Send Normal Message

- URL: `{{apiBaseUrl}}/{{vendorUid}}/contact/send-message`
- Authorization: Bearer Token
- Body:
```json 
{
    // optional from phone number id is not given it will use default phone number id
    "from_phone_number_id": "{{fromPhoneNumberId}}",
    "phone_number": "{{phoneNumber}}",
    "message_body": "your message body",
    // if you want to create contact if it does not exist
    "contact": {
        "first_name" : "Johan",
        "last_name" : "Doe",
        "email" : "johndoe@doamin.com",
        "country" : "india",
        "language_code" : "en",
        "groups" : "examplegroup1,examplegroup2",
        "custom_fields" : {
            "BDay" : "2025-09-04"
        }

    }
}
```

# Send Media Message

- URL: `{{apiBaseUrl}}/{{vendorUid}}/contact/send-media-message`
- Authorization: Bearer Token
- Body:
```json 
{
    // optional from phone number id is not given it will use default phone number id
    "from_phone_number_id": "{{fromPhoneNumberId}}",
    "phone_number" : "{{phoneNumber}}",
    "media_type" : "image",
    // "media_type" : "document",

    "media_url" : "https://images.pexels.com/photos/276267/pexels-photo-276267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "caption" : "your capation for image or video media types",
    "file_name" : "your file name for document",
    // if you want to create contact if it does not exist
    "contact": {
        "first_name" : "Johan",
        "last_name" : "Doe",
        "email" : "johndoe@doamin.com",
        "country" : "india",
        "language_code" : "en",
        "groups" : "examplegroup1,examplegroup2"
    }
}
```

# Send Template Message

- URL: `{{apiBaseUrl}}/{{vendorUid}}/contact/send-template-message`
- Authorization: Bearer Token
- Body:
```json 
{
    // optional from phone number id is not given it will use default phone number id
    "from_phone_number_id": "{{fromPhoneNumberId}}",
    "phone_number": "{{phoneNumber}}",
    "template_name" : "your_template_name",
    "template_language" : "en",
    "header_image" : "https://cdn.pixabay.com/photo/2015/01/07/15/51/woman-591576_1280.jpg",
    "header_video" : "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "header_document" : "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "header_document_name" : "{full_name}",
    "header_field_1" : "{full_name}",
    "location_latitude" : "22.22",
    "location_longitude" : "22.22",
    "location_name" : "{first_name}",
    "location_address" : "{country}",
    "field_1" : "{Age}",
    "field_2" : "{full_name}",
    "field_3" : "{first_name}",
    "field_4" : "{last_name}",
    "button_0" : "{email}",
    "button_1" : "{phone_number}",
    "copy_code" : "YourCode",
    // if you want to create contact if it does not exist
    "contact": {
        "first_name" : "Johan",
        "last_name" : "Doe",
        "email" : "johndoe@doamin.com",
        "country" : "india",
        "language_code" : "en",
        "groups" : "examplegroup1,examplegroup2"
    }
}
```

# Send Interactive Message

- URL: `{{apiBaseUrl}}/{{vendorUid}}/contact/send-interactive-message`
- Authorization: Bearer Token
- Body:
```json 
{
    // optional from phone number id is not given it will use default phone number id
    "from_phone_number_id": "",
    "phone_number" : "918856066529",
    "interactive_type" : "button", // cta_url, list
    "media_link": "", // When header_type is image, video or document
    "header_type": "text",
    "header_text": "Interactive Text Header",
    "body_text": "Interactive bot 1",
    "footer_text": "footer text",
    "buttons": { // When "interactive_type" is "button"
        "1": "button 1",
        "2": "button 2",
        "3": "button 3"
    },
    "cta_url": { // When "interactive_type" is "cta_url"
        "display_text": "CTA button Text",
        "url": "CTA button URL"
    },
    "list_data": { // When "interactive_type" is "list"
        "button_text": "List Msg Btn Label",
        "sections": {
            "section_1": {
                "title": "Section 1",
                "id": "section_1",
                "rows": {
                    "row_1": {
                        "id": "row_1",
                        "row_id": "1",
                        "title": "Row 1 title",
                        "description": "row 1 description"
                    }
                }
            },
            "section_2": {
                "title": "Section 2",
                "id": "section_2",
                "rows": {
                    "row_1": {
                        "id": "row_1",
                        "row_id": "1",
                        "title": "row 1 title",
                        "description": "row 1 description"
                    }
                }
            }
        }
    },
    // if you want to create contact if it does not exist
    "contact": {
        "first_name" : "Johan",
        "last_name" : "Doe",
        "email" : "johndoe@doamin.com",
        "country" : "india",
        "language_code" : "en",
        "groups" : "examplegroup1,examplegroup2"
    }
}
```
