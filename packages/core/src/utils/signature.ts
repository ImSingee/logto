import { createHmac } from 'node:crypto';

import { canonicalize } from 'json-canonicalize';

export const generateSignature = (signingKey: string, payload: Record<string, unknown>) => {
  const hmac = createHmac('sha256', signingKey);
  const payloadString = canonicalize(payload);
  hmac.update(payloadString);
  return `sha256=${hmac.digest('hex')}`;
};
