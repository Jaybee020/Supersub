import { Resend } from 'resend';

import { config } from '~/pkg/env';

export const resend = new Resend(config.RESEND_API_KEY);
