# Messaging API

The Messaging API allows you to send and receive WhatsApp messages.

It is designed to empower businesses with the tools for sending high-scale messages to customers through WhatsApp. Since our API is designed for easy understanding and use, you can also use [Meta documentation](https://developers.facebook.com/docs/whatsapp) as a reference.

## Getting started

For any outgoing actions in the Messaging API, you need to use requests with appropriate endpoints.

* All Cloud API actions are available via different request types that use a combination of a root base URL and an endpoint suffix. To ensure that you use the correct endpoints for your API calls, we recommend to set-up `https://waba-v2.360dialog.io/` as a base URL and, for each request suffix, you can refer to our documentation or reach out to our[ Support Team](broken-reference) for clarification.
  * While referring to Meta documentation, you may encounter requests with the path **`/PHONE_NUMBER_ID`**. Please note that 360dialog already transmits this value to Meta, hence, there is **no need to include it in your request, as doing so may result in errors.** (e.g. <mark style="color:green;">`waba-v2.360dialog.io/`</mark><mark style="color:red;">**`PHONE_NUMBER_ID/`**</mark><mark style="color:green;">`business_compliance_info`</mark>)&#x20;
  * See [Cloud API Error Codes](../../support/api-error-message-list#cloud-api-error-codes)
* The body of the request to the API will determine what exactly you want to send (text, image, etc.).
* You need to use an API key received from the client in authorization purposes.&#x20;
* A business cannot send a freely composed message first. If business starts a conversation with a user, it should use a template message. Please do not forget about Opt-In requirements.&#x20;
* Tip: we can recommend to use Postman as first step instrument to test WABA opportunities.

To receive any information that is not a response to your request to the API (e.g. incoming messages from users) you need to set a webhook address.

* It should be unique for every WABA number&#x20;
* It should return an HTTPS 200 OK response immediately (before any other processing begins)

**Registration Limits**: A phone number is limited to 10 registration requests in a 72 hour (3 days) moving window. This restriction applies to actions like WABA Creation, Display Name Change, Migrating numbers from On-premise to Cloud API and registering Test Numbers. If a business exceeds this limit, the phone number will be rate limited and blocked for the next 72 hours before being restored. In case you have any issues, please [reach out to our Support Team](broken-reference).&#x20;



### Cloud API Local Storage

Local Storage for Cloud API numbers allows businesses to choose the location where their message data is stored at rest. For regulated industries like finance, government, or healthcare, storing data in a specific country may align with regulatory or company policies.

Refer to our [Architecture and Security ](../architecture-and-security#local-storage)documentation for details on Cloud API Local Storage.

With such settings enabled, Cloud API uses a localized storage in the specified country for persisting message content, instead of using its **default storage based in the US**. Alternatively, by disabling Local Storage, Cloud API reverts to its default storage based in the US.

If you wish to enable the local storage of a WABA [please reach out to our Support Team](https://docs.360dialog.com/docs/useful/help-and-support) with the specific location, and we will enable this feature for you. You will need to receive a pin code in the phone number to confirm the change to local storage.

To adjust the local storage settings for your WABA, access the [**Numbers**](../insights/numbers) > **Details** section within the 360dialog Hub. There, the **Data Localization** feature allows you to select a desired storage location.

[Your Partner can also enable this setting for you. Please refer to our specific Partner documentation. ](https://docs.360dialog.com/partner/waba-management/using-the-partner-api-to-manage-clients-and-channels#available-regions)

## Base URL

The default base URL for the Cloud API is `https://waba-v2.360dialog.io` followed by the path-specific endpoint.&#x20;



## Prerequisites & Basic Setup&#x20;

### 1. Retrieve API Key

In order to send requests with the 360dialog Cloud API, you will need an API KEY.&#x20;

{% hint style="info" %}
Each registered WhatsApp phone number has its own API KEY
{% endhint %}

Only the newest API key is valid, so if you generate another API key, the old one will stop working.

#### &#x20;[▶ **Retrieve API Key**](../client-hub/api-key)



### 2. Set WABA Webhook URL

To receive notifications for in and outbound messages, you have to set a webhook URL.&#x20;

{% hint style="danger" %}
Webhook URLs or headers for Cloud API do not support _"_`_`_"_`(underscore)` or "`:xxxx`"`(port)`in (sub)domain names.

**Invalid webhook URL:** `https://your_webhook.example.com` \
**Valid webhook URL:** `https://yourwebhook.example.com`

**Invalid webhook URL:**`https://subdomain.your_webhook.example.com`**`:3000`** \
**Valid webhook URL:** `https://subdomain.yourwebhook.example.com`
{% endhint %}

#### &#x20;[▶ Set Webhook URL](../../waba-messaging/webhook#set-webhook-url)

See [Webhook events and Notifications](webhook-events-and-notifications) to find information about the payloads.

## Send & Receive Messages

### 3. Send a message

Once you get the `wa_id`, you can start sending messages.

Use the messages node`/messages`to send text messages, media, documents, and message templates to your customers.

You can send messages by making a `POST` call to the `/messages` node regardless of message type. The content of the JSON message body differs for each type of message (text, image, etc.).

#### &#x20;▶[ Send A Message](../../waba-messaging/messaging#send-text-messages)

#### Example payload

```json
POST https://waba-v2.360dialog.io/messages

{
    "recipient_type": "individual",
    "to": "wa_id",
    "messaging_product":"whatsapp",
    "type": "text",
    "text": {
        "body": "Hello, dear customer!"
    }
}
```

{% hint style="info" %}
If this `wa_id` did not sent a message to your WhatsApp Business Account within the last 24 hours, you can only reach this number with a [template message](../waba-messaging/template-messaging).&#x20;
{% endhint %}

{% embed url="https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages" %}
See the official WhatsApp documentation for information regarding the type of messages you want to send.
{% endembed %}



### 4. Receive a message

In case you have set a webhook URL as described in step[ **2. Set Webhook URL**,](#2.-set-webhook-url) you will have received a Outbound Message Status Notification for your test message by now.

In this Webhook URL, you will receive:

* Messages sent by users
* Message status notifications

If a webhook event isn't delivered or if the webhook request returns a HTTP status code other than 200, we retry the webhook delivery. We continue retrying delivery with increasing delays up to a certain timeout (typically 24 hours, though this may vary), or until the delivery succeeds.

See [Receiving Messages via Webhook](../waba-messaging/webhook).



### Country Restrictions

{% hint style="success" %}
As of May 15, 2024, Türkiye is no longer restricted for Cloud API business messaging. Cloud API businesses can now initiate conversations and receive messages from WhatsApp users with Turkish numbers.
{% endhint %}

In addition to the mentioned [country restrictions](../../support/client-faq#which-countries-are-blocked-from-using-the-whatsapp-business-api), businesses operating with Cloud API in Turkey can utilize the WhatsApp Platform for their communication needs. However, due to limitations, users within Turkey are unable to receive messages sent through the API. [See Meta documentation for more information.](https://developers.facebook.com/docs/whatsapp/cloud-api/support/troubleshooting/#country-restrictions)

