import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

import { queue } from '~/pkg/bullmq';

export const bullBoardMiddleware = () => {
  const bullMqServerAdapter = new ExpressAdapter();
  bullMqServerAdapter.setBasePath('/ui');

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter: bullMqServerAdapter,
  });

  return bullMqServerAdapter.getRouter();
};
