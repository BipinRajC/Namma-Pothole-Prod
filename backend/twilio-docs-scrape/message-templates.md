# Send WhatsApp Notification Messages with Templates

## WhatsApp message templates overview

A WhatsApp message template is a message format that you can use over and over again to message users once they have opted-in and given your app permission to send them messages. To use a message template, you must first create and submit it to WhatsApp using the [Content Template Builder or Content API](content/overview). Meta reviews and approves each message template to maintain high-quality content and avoid spam. Once WhatsApp has approved your template, you can use the Content Template to send notifications. For more info on WhatsApp's template approval process, [refer to this article](/docs/whatsapp/tutorial/message-template-approvals-statuses).

Templates use placeholder values that can be replaced with dynamic content using Content Variables when the message is sent:

* `Your appointment for {{1}} is scheduled for {{2}}. Need to reschedule? Tap below to reply.`
* Example of a message sent using this template: Your appointment for your doctor's appointment is scheduled for Tuesday at 10 AM. Need to reschedule? Tap below to reply.
* Note that a single placeholder can contain multiple words.

Think of your template message as a conversation starter; the goal is to convert this initial message into a two-way conversation when the user replies. Two-way conversations are considered higher value because you are engaging with your end-user. In addition, they reduce your spend because WhatsApp does not charge for free-form outbound messages nor Utility template messages within the [24-hour customer service window](/docs/whatsapp/key-concepts#customer-service-windows). For more information on pricing, see our [pricing page](https://www.twilio.com/en-us/whatsapp/pricing).

### Sending free-form messages within a 24-hour customer service window

If a WhatsApp user has sent your application a message — whether it's a reply to one of your outbound messages, or they have initiated communication themselves — your application has a **24-hour customer service window** to send that user messages that don't need to use a template. This customer service window lasts for 24 hours after the last inbound message you receive from a user.

When your application sends a message to a WhatsApp user outside this window, the message **must** use an approved template.

### Templates pre-provisioned for the Sandbox

Twilio has pre-provisioned Content Templates using each of WhatsApp's template categories for testing in the [WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/learn). The Sandbox guides you through using Content Templates and Content Variables and provides sample code snippets using Twilio SDKs.

For more information, see the [guide to getting started with the Twilio Sandbox for WhatsApp](/docs/whatsapp/sandbox).

## WhatsApp template categories

Your WhatsApp message templates *must fall into one of the following categories.*

* **Authentication:** Authenticate users with one-time passcodes. The body text is determined by Meta and cannot be changed.
* **Utility:** Share important information related to a specific, agreed-upon transaction and accomplish one of the following: confirm, suspend, or change a transaction or subscription.
* **Marketing:** Send promotional offers, product announcements, and more to increase awareness and engagement. **Any template that has a mix of utility and marketing content will be classified by Meta as a marketing template.**

Meta bases their message fees on template categories. Any templates that do not clearly result from an explicit end-user request will likely be categorized by Meta as "Marketing". Learn more in our [pricing page](https://www.twilio.com/en-us/whatsapp/pricing) and refer to our [best practices](https://help.twilio.com/articles/360039737753-Recommendations-and-Best-Practices-for-Creating-WhatsApp-Message-Templates) for guidance on creating WhatsApp templates. Meta determines template categories at their sole discretion.

## Creating message templates and submitting them for approval

To send notifications outside of the customer service window, you need to create your own templates for these messages.

Content Templates are omnichannel templates and offer access to WhatsApp templates. Content Templates are message templates that can be used on any channel, including WhatsApp. They offer flexibility and help ensure your implementation remains compatible with future updates at Twilio. For more detailed information about [Content Templates and how to use them with WhatsApp, refer to this page](/docs/content).

| Feature                     | What is supported in Content Templates                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Supported channels**      | WhatsApp, SMS, MMS, Facebook Messenger                                                                     |
| **Sending messages**        | Send messages with a ContentSid field                                                                      |
| **Messaging Service**       | Required                                                                                                   |
| **Rich feature support**    | Latest rich features supported by Twilio, such as catalog, carousels, media templates, and dynamic buttons |
| **API to manage templates** | Content API                                                                                                |
| **UI to manage templates**  | Content Editor in the Twilio Console, go to Messaging > Content Editor                                     |

### Set up WhatsApp message templates in your Twilio account

To create a WhatsApp template:

1. Go to **[Twilio Console > Messaging > Content Template Builder](https://console.twilio.com/us1/develop/sms/content-template-builder)**.
2. Click on **Create new**.

   ![Content Template Builder interface with a highlighted Messaging menu and a prompt to create your first content template.](https://docs-resources.prod.twilio.com/78188c0bd82b7063c2348ae8cc79e538d688459937727d383052a788e9685e5f.png)

   > \[!NOTE]
   >
   > If you are creating a template for the first time, you will see the **Create your first content template** button. Click it to create templates.
3. On the next screen, fill out the information to submit to WhatsApp. WhatsApp's team uses the information you submit to approve or reject your template submission.

   For more information, refer to [this page on creating Content Templates](/docs/content/create-templates-with-the-content-template-builder).

   * **Template name:** The name can only contain lowercase alphanumeric characters and underscores. **Tip:** Use a name that helps WhatsApp's reviewer understand the purpose of your message, for example, `"order_delivery"` rather than `"template_1"`.
   * **Template category:** You must select the category that matches WhatsApp's definition. See [Meta's docs](https://developers.facebook.com/docs/whatsapp/updates-to-pricing/new-template-guidelines) for definitions and examples. Authentication templates have special constraints ([see below](#authentication-templates)).
   * **Message language:** Select from the languages provided by WhatsApp.
   * **Message body:** The text of the message that you want to send. WhatsApp doesn't allow multiple sequential line breaks.
   * **Buttons and other rich features:** There are a variety of button types and other rich features that can be added into a content template. To see a full list of supported template types, see our [content type overview here](/docs/content/content-types-overview).
4. After you fill out the message template, click **Save and submit for WhatsApp approval**.

![Configure call to action with button for Visit website, including body and URL fields, and option for WhatsApp approval.](https://docs-resources.prod.twilio.com/7d6b5d25509fd6092a56438084b1f62f91a246751b82c8a32347c4af50ea3646.png)

If your template includes placeholders (like `"Hello {{1}}! We've received your request regarding {{2}}."`), a modal will appear for you to add sample content for each placeholder. Enter sample text for each placeholder and then click **Save and submit** to submit your template to WhatsApp.

![Add sample data to variables for message templates and button URLs with fields for input and saving options.](https://docs-resources.prod.twilio.com/2628bb52d2731c5209cc5c23e9f800d92fa0b657b2ff10ce7d676d1c7e40602f.png)

**Note:** Once you submit a template, it currently cannot be edited.

Refer to the WhatsApp documentation to learn more about [message template formatting and supported languages](https://developers.facebook.com/docs/whatsapp/message-templates/creation/).

### Authentication templates

When creating a template with the category of Authentication (i.e., Authentication Templates) using WhatsApp Templates, certain restrictions apply to comply with WhatsApp's policies:

1. The body text of the template is set by WhatsApp for every language and is not editable.
2. A "Copy Code" button is required, which users can use to copy the one-time passcode. The button label is editable per language.

To learn more about Authentication Templates, [see more here](/docs/content/whatsappauthentication).

### Template translations

WhatsApp currently evaluates each template language translation on an individual basis. Content Templates offer searching and filtering tools to help manage your templates.

### Removing WhatsApp message templates

To delete a message template:

* Click on the template name on the WhatsApp Message Templates page.
* Click **Delete** at the bottom of the page.
* Alternatively, click on the 3-dot menu on the right-hand side of the template and select **Delete**.

Per WhatsApp guidelines, you may not reuse the name of a deleted template for 30 days after deletion.

> \[!NOTE]
>
> WhatsApp now supports up to 6000 template translations in total, across all templates, per account. Previous limits of 250 and 1500 templates no longer apply.

### Submitting templates for approval to WhatsApp

Most templates submitted to WhatsApp for approval are reviewed within minutes. To learn more about WhatsApp's approval process and for additional information, [refer to this article](/docs/whatsapp/tutorial/message-template-approvals-statuses).

## Send a WhatsApp message using a template

Twilio supports sending Content Templates using the `ContentSid` and `ContentVariables` parameters.

To send a templated message, include the `ContentSid` parameter in the call with the `HX` content SID of the template you would like to send. If your template includes variables, set them using the `ContentVariables` parameter. Twilio will send the message as a templated message if it matches one of the approved templates. For more information, [refer to this page on sending Content Templates](/docs/content/send-templates-created-with-the-content-template-builder).

For example, if your approved template is:

```bash
Hi {{1}}! Thanks for placing an order with us. We'll let you know once your order has been processed and delivered. Your order number is {{2}}. Thanks
```

In the `ContentVariables` parameter of the message resource, provide the end user's information as follows:

```bash
ContentVariables={ "1": "Joe", "2": "O12235234" }
```

Send a WhatsApp message using a message template

```js
// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    contentSid: "HXXXXXXXXX",
    contentVariables: JSON.stringify({ 1: "Name" }),
    from: "whatsapp:+15005550006",
    messagingServiceSid: "MGXXXXXXXX",
    to: "whatsapp:+18551234567",
  });

  console.log(message.body);
}

createMessage();
```

```python
# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
import json

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = os.environ["TWILIO_ACCOUNT_SID"]
auth_token = os.environ["TWILIO_AUTH_TOKEN"]
client = Client(account_sid, auth_token)

message = client.messages.create(
    content_sid="HXXXXXXXXX",
    to="whatsapp:+18551234567",
    from_="whatsapp:+15005550006",
    content_variables=json.dumps({"1": "Name"}),
    messaging_service_sid="MGXXXXXXXX",
)

print(message.body)
```

```csharp
// Install the C# / .NET helper library from twilio.com/docs/csharp/install

using System;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;

class Program {
    public static async Task Main(string[] args) {
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        string accountSid = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID");
        string authToken = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN");

        TwilioClient.Init(accountSid, authToken);

        var message = await MessageResource.CreateAsync(
            contentSid: "HXXXXXXXXX",
            to: new Twilio.Types.PhoneNumber("whatsapp:+18551234567"),
            from: new Twilio.Types.PhoneNumber("whatsapp:+15005550006"),
            contentVariables: JsonConvert.SerializeObject(
                new Dictionary<string, Object>() { { "1", "Name" } }, Formatting.Indented),
            messagingServiceSid: "MGXXXXXXXX");

        Console.WriteLine(message.Body);
    }
}
```

```java
// Install the Java helper library from twilio.com/docs/java/install

import com.twilio.type.PhoneNumber;
import java.util.HashMap;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.json.JSONObject;

public class Example {
    // Find your Account SID and Auth Token at twilio.com/console
    // and set the environment variables. See http://twil.io/secure
    public static final String ACCOUNT_SID = System.getenv("TWILIO_ACCOUNT_SID");
    public static final String AUTH_TOKEN = System.getenv("TWILIO_AUTH_TOKEN");

    public static void main(String[] args) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
        Message message = Message
                              .creator(new com.twilio.type.PhoneNumber("whatsapp:+18551234567"),
                                  new com.twilio.type.PhoneNumber("whatsapp:+15005550006"),
                                  "HXXXXXXXXX")
                              .setContentVariables(new JSONObject(new HashMap<String, Object>() {
                                  {
                                      put("1", "Name");
                                  }
                              }).toString())
                              .setMessagingServiceSid("MGXXXXXXXX")
                              .create();

        System.out.println(message.getBody());
    }
}
```

```go
// Download the helper library from https://www.twilio.com/docs/go/install
package main

import (
	"encoding/json"
	"fmt"
	"github.com/twilio/twilio-go"
	api "github.com/twilio/twilio-go/rest/api/v2010"
	"os"
)

func main() {
	// Find your Account SID and Auth Token at twilio.com/console
	// and set the environment variables. See http://twil.io/secure
	// Make sure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN exists in your environment
	client := twilio.NewRestClient()

	ContentVariables, ContentVariablesError := json.Marshal(map[string]interface{}{
		"1": "Name",
	})

	if ContentVariablesError != nil {
		fmt.Println(ContentVariablesError)
		os.Exit(1)
	}

	params := &api.CreateMessageParams{}
	params.SetContentSid("HXXXXXXXXX")
	params.SetTo("whatsapp:+18551234567")
	params.SetFrom("whatsapp:+15005550006")
	params.SetContentVariables(string(ContentVariables))
	params.SetMessagingServiceSid("MGXXXXXXXX")

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	} else {
		if resp.Body != nil {
			fmt.Println(*resp.Body)
		} else {
			fmt.Println(resp.Body)
		}
	}
}
```

```php
<?php

// Update the path below to your autoload.php,
// see https://getcomposer.org/doc/01-basic-usage.md
require_once "/path/to/vendor/autoload.php";

use Twilio\Rest\Client;

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
$sid = getenv("TWILIO_ACCOUNT_SID");
$token = getenv("TWILIO_AUTH_TOKEN");
$twilio = new Client($sid, $token);

$message = $twilio->messages->create(
    "whatsapp:+18551234567", // To
    [
        "contentSid" => "HXXXXXXXXX",
        "from" => "whatsapp:+15005550006",
        "contentVariables" => json_encode([
            "1" => "Name",
        ]),
        "messagingServiceSid" => "MGXXXXXXXX",
    ]
);

print $message->body;
```

```ruby
# Download the helper library from https://www.twilio.com/docs/ruby/install
require 'rubygems'
require 'twilio-ruby'

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = ENV['TWILIO_ACCOUNT_SID']
auth_token = ENV['TWILIO_AUTH_TOKEN']
@client = Twilio::REST::Client.new(account_sid, auth_token)

message = @client
          .api
          .v2010
          .messages
          .create(
            content_sid: 'HXXXXXXXXX',
            to: 'whatsapp:+18551234567',
            from: 'whatsapp:+15005550006',
            content_variables: {
                '1' => 'Name'
              }.to_json,
            messaging_service_sid: 'MGXXXXXXXX'
          )

puts message.body
```

```bash
# Install the twilio-cli from https://twil.io/cli

twilio api:core:messages:create \
   --content-sid HXXXXXXXXX \
   --to whatsapp:+18551234567 \
   --from whatsapp:+15005550006 \
   --content-variables {\"1\":\"Name\"} \
   --messaging-service-sid MGXXXXXXXX
```

```bash
CONTENT_VARIABLES_OBJ=$(cat << EOF
{
  "1": "Name"
}
EOF
)
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
--data-urlencode "ContentSid=HXXXXXXXXX" \
--data-urlencode "To=whatsapp:+18551234567" \
--data-urlencode "From=whatsapp:+15005550006" \
--data-urlencode "ContentVariables=$CONTENT_VARIABLES_OBJ" \
--data-urlencode "MessagingServiceSid=MGXXXXXXXX" \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

```json
{
  "account_sid": "ACXXXXXXXXX",
  "api_version": "2010-04-01",
  "body": "Hello! 👍",
  "date_created": "Thu, 24 Aug 2023 05:01:45 +0000",
  "date_sent": "Thu, 24 Aug 2023 05:01:45 +0000",
  "date_updated": "Thu, 24 Aug 2023 05:01:45 +0000",
  "direction": "outbound-api",
  "error_code": null,
  "error_message": null,
  "from": "whatsapp:+15005550006",
  "num_media": "0",
  "num_segments": "1",
  "price": null,
  "price_unit": null,
  "messaging_service_sid": "MGXXXXXXXX",
  "sid": "SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "status": "queued",
  "subresource_uris": {
    "media": "/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Media.json"
  },
  "to": "whatsapp:+18551234567",
  "uri": "/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json"
}
```

### Encountering error code 63016

[Twilio's Error 63016](/docs/api/errors/63016) indicates that you are making an attempt to send a message when there's no customer service window open with that user. This may happen if your template was rejected later by WhatsApp. If you need to change the template to match your needs, submit a new template. If you are seeing a different error code and you believe it is related to templates, open a support ticket, and we will help you understand why this is happening.

### Including new lines and escape characters in your templates

If you are rendering new lines or other escaped characters, encode the line breaks properly based on the language you are using. The Twilio Console may show line breaks and other escaped characters in their raw form, such as `\n`.

## Initiate the customer service window with a generic template

You may want to send different types of notifications and messages to your users. However, it is difficult and inefficient to go through the template approval process for every type of message you wish to send to your end users.

For example, if you want to send a time-sensitive message to all of your end users, such as "Today, we are having a company-wide announcement at 11 a.m.," it is unlikely that WhatsApp will approve this template, which makes it challenging to build a real notification flow.

To work around this, you can create a generic template that asks your end users to respond. An example of a generic notification template you can submit for approval is:

`"Hello {{1}}, we have a new update regarding your account. Respond to this message to receive it. Have a nice day!"`

Once an end user replies to this templated message, it initiates the 24-hour customer service window, during which your business can send free-form messages.

## Monitoring live templates

Once you start using your templates, monitor them for excessive negative user feedback.

### Paused and disabled templates

If end users repeatedly block or report spam in association with a message template, WhatsApp will pause the template for a period of time to protect the quality rating of senders that have used the template. Pausing durations are as follows:

* First instance: **Paused** for 3 hours
* Second instance: **Paused** for 6 hours
* Third instance: **Disabled**

When a template is paused a third time, it will be permanently disabled. Messages sent using paused or disabled templates will fail. Paused and disabled message templates that are attempted to be sent do not count against the daily messaging limit.

### Getting alerts for paused, disabled, and rejected templates

Twilio can send a notification using [Twilio Alerts](/docs/messaging/guides/debugging-tools#custom-alerts) when a template status changes to `paused`, `disabled`, or `rejected`. To get notified, create an alert for error 63041 (`paused`), 63042 (`disabled`), and/or 63040 (`rejected`). We also offer alarms for approved templates with code 63046.

## Including links in your templates

You may send URLs in a template. For example: "Thanks for registering with My Business. To continue, click on https://app.example.com."

WhatsApp does not currently support URL previews in templated messages. URL previews are supported in in-session messages.

## What's next?

Ready to create your own WhatsApp templates? Go to the [Twilio Console](https://www.twilio.com/console) to get started.