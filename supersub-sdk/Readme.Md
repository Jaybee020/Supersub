## Supersub SDK

This is a light weight js module to help integrate your apps with the supersub

### Check if an address is subscribed to a plan

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const isSubscribed = await sdk.checkAddressSubscribedToPlan(subscriber, planId);
```

### Generate a checkout link

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const checkoutLink = sdk.generateSubscribeCheckoutLink(planRef);
```

### Get all subscriptions for an address

```js
import { SupersubSDK } from "supersub-sdk";

const sdk = new SupersubSDK();
const subscriptions = await sdk.getSubscriptionsByAddress(subscriber);
```
