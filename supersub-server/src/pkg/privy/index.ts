import { PrivyClient } from '@privy-io/server-auth';

import { config } from '~/pkg/env';

export const privy = new PrivyClient(config.PRIVY_APP_ID, config.PRIVY_APP_SECRET);
