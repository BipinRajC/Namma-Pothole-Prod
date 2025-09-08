
# WhatsApp Accounts structure

Every WhatsApp Business API account is associated to a few other instances that can be managed through the Facebook Business Manager or in the 360dialog Client Hub.

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2FMYvpJgUVoASmhZqCdtVI%2Fimage%20(23).png?alt=media&#x26;token=a87cba0d-30ab-4951-b2d7-5426d73a42d1" alt="" width="563"><figcaption></figcaption></figure>

## Business Manager account

A Meta Business Manager account is needed for any business to manage their assets in the Facebook, WhatsApp and Instagram environment.

A Business Manager account can be created through the URL [business.facebook.com](https://business.facebook.com/) or during the [Embedded Signup process.](../waba-management/embedded-signup/using-a-new-phone-number) You will need to use your Facebook profile. [See how here.](https://www.facebook.com/business/help/1710077379203657?id=180505742745347)

It is recommended that:

* Users check with all stakeholders if a Business Manager does not exist for the company before creating a new one to avoid duplication.
* Users associate all Facebook Pages, Instagram Pages and Ads Accounts to this same Business Manager to avoid loss of information.
* Users check if the Business Manager being used is under the company's name and not a third party (like an agency or service company, for example). Do not create a WABA for a company under another company's Business Manager.

Each Business Manager has a specific ID.&#x20;

A company can have multiple Business Managers, but this is not recommended since one WABA cannot be migrated from one Business Manager to another. A single Business Manager can contain multiple WhatsApp Business Accounts.&#x20;

You can also share a WhatsApp Business Account with multiple Business Managers, but only one can own the account.

To have full access to the WhatsApp Business API environment, without message sending limits, the Business Manager needs to be verified. [Read more about Business Verification here.](broken-reference)

### How to find the Business Manager ID

The Business Manager ID (also called Facebook ID, FB ID, Business Manager ID or Business ID) identifies a specific Business Manager Account.

To discover what is your Business Manager's ID, please go to your Business Manager's settings, and then to the Business Info page:

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2F7eGGYVFyLpVHyxpyM3vb%2FScreenshot%202023-05-29%20at%2011.16.44.png?alt=media&#x26;token=8459d57a-c923-4401-b9b4-5c0500d06052" alt=""><figcaption></figcaption></figure>

#### How do I know if this Meta Business Manager ID owns my WhatsApp Business API Account?

If you can see a WhatsApp Account in your Business Manager, this doesn't necessarily mean that it owns the account.

To make sure which Business Manager owns a specific WhatsApp Account, you need to access the WhatsApp Accounts page:

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2FULLVveexZjhSTifIPLJS%2FScreenshot%202023-05-29%20at%2011.17.23.png?alt=media&#x26;token=3cc4faea-5538-40c2-b1d6-866643141677" alt=""><figcaption></figcaption></figure>

Please note that the ID that appears on the side of the "Owned by" information is not the Business Manager ID. This is the WABA ID, which will be explained in the next topic.

#### What if I can't see my WhatsApp Business API account in the WhatsApp Accounts page in the Business Manager?

This means that this Business Manager does not own the account. In this case, you will need to reach out to your BSP and request the Business Manager ID that owns this WhatsApp Business API account.

#### Can I use the URL to identify the Business Manager ID that owns a WhatsApp account?

No. When using the Business Manager, you will always see a Business ID in the URL. This ID represents the Business Manager that you are using, not the Business Manager that owns a WhatsApp account.

## WhatsApp Business Account

The WhatsApp Business Account (also known as WABA) manages the phone numbers registered in the WhatsApp Business environment. There are two different WABA types:

* **WhatsApp Business App**: This account can be created directly in the Facebook Business Manager. It only gives access to the WhatsApp Business App.
* **WhatsApp Business API**: This account can only be created through a BSP like 360dialog.[ Read more about the advantages of a WhatsApp Business API here](broken-reference).&#x20;

Each WABA has its own ID.

A single Business Manager can contain up to 20 different WABAs. This limit can be expanded upon request (filing a support ticket).

Each phone number can only be registered as one type of account. When a phone number is registered in the WhatsApp Business API, it cannot be used in the WhatsApp Consumer App or Business App.

You will create a WhatsApp Business API account when you submit a 360dialog signup form. If you already have a 360dialog Client Hub account you can submit multiple phone numbers to a same WABA by [following these steps](https://docs.360dialog.com/360-client-hub/the-360-client-hub#6-add-an-additional-number-to-an-existing-whatsapp-account).

### How to find the WhatsApp Business Account ID

The WhatsApp Business Account ID (or WABA ID) is shown in the WhatsApp Accounts page:

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2F9uGt1abiSJBSdfwwfZRk%2FScreenshot%202023-05-29%20at%2011.22.08.png?alt=media&#x26;token=65cb078e-4e91-4a3c-91a2-5b636d28929d" alt=""><figcaption></figcaption></figure>

## Phone Number

A Phone Number always needs to be associated to a WhatsApp Account so this accounts can send and receive messages.

For WhatsApp Business API accounts, this number needs to be registered and verified during the signup process with the BSP. If you already have a 360dialog Client Hub account you can submit multiple phone numbers to a same WABA by [following these steps](https://docs.360dialog.com/360-client-hub/the-360-client-hub#6-add-an-additional-number-to-an-existing-whatsapp-account).

A single WABA is initially limited to 2 registered business phone numbers, but this limit can be increased to up to 20.

This limit automatically increase if the business is verified **or** the phone number reached the 1,000 messaging limit and sent enough paid messages.

If increase is approved, you receive `business_capability_update` webhook and Meta Business Suite notification of your new limit.

If the business has been verified for over a week but the phone number limit hasn’t increased, [check and improve the phone number's message quality scores](https://developers.facebook.com/docs/whatsapp/guides/how-to-monitor-quality-signals). Once improved, Meta will automatically re-evaluate and update the phone number limit if eligible.

### How to manage phone numbers

If you created your account via Embedded Signup, you can see the phone numbers that are registered under a specific WhatsApp Account directly from your Business Manager:

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2F96Ur8SHLJg0GiSv1uVzT%2FScreenshot%202023-05-29%20at%2011.23.43.png?alt=media&#x26;token=09649bd5-3821-4124-8905-d73dfb668cbb" alt=""><figcaption></figcaption></figure>

<figure><img src="https://3527970750-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-M4sMxKjL6eJRvZn6jeG-887967055%2Fuploads%2F0dNK7iI5UrryMjCrdVvN%2FScreenshot%202023-05-29%20at%2011.23.56.png?alt=media&#x26;token=bcdfb887-7227-4ffc-8a74-285e5f131b05" alt=""><figcaption></figcaption></figure>

In this page, you will be able to see the status of this number.

To add a new phone number in a WhatsApp Business API account, **please do not use the Meta Business Manager**. This setup will not work. A new WhatsApp Business API number should always be added from the 360dialog Client Hub dashboard.

### 2FA (two-factor authentication)

Two-step verification (2FA) adds an extra layer of security to the WhatsApp Business API Client. When enabled, any attempt to register the phone number on WhatsApp requires the six-digit PIN created during setup. On our platform, 2FA is enabled by default for all registered numbers. 2FA can be disabled [by following these steps.](../waba-management/disable-2fa)&#x20;
