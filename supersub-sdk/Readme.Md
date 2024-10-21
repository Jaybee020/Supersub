## Supersub SDK

This is a light weight js module to help integrate your apps with the supersub

### Check if an address is subscribed to a plan

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const opts = {
  subscriber: "0x1234567890123456789012345678901234567890",
  planId: 1,
};
const isSubscribed = await sdk.checkAddressSubscribedToPlan(opts);
```

### Generate a checkout link

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const opts = {
  planRef: "84532:1",
  beneficiary: "0x1234567890123456789012345678901234567890", //optional beneficiary of the subscription benefits
  startDate: 1679043200, //optional start date parameter
};
const checkoutLink = sdk.generateSubscribeCheckoutLink(opts);
```

### Get all subscriptions for an address

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const opts = {
  subscriber: "0x1234567890123456789012345678901234567890",
  minPlanId: 1, //optional minimum plan id
  maxPlanId: 10, //optional maximum plan id
};
const subscriptions = await sdk.getSubscriptionsByAddress(opts);
```
