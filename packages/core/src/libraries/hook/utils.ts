import { type HookEventPayload } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { type OptionsOfTextResponseBody, type Response } from 'got';

import { generateSignature } from '#src/utils/signature.js';

export const parseResponse = ({ statusCode, body }: Response) => ({
  statusCode,
  // eslint-disable-next-line no-restricted-syntax
  body: trySafe(() => JSON.parse(String(body)) as unknown) ?? String(body),
});

type CreateHookRequestOptions = {
  signingKey: string;
  payload: HookEventPayload;
  customHeaders?: Record<string, string>;
  retries?: number;
};

export const createHookRequestOptions = ({
  signingKey,
  payload,
  customHeaders,
  retries,
}: CreateHookRequestOptions): OptionsOfTextResponseBody => ({
  headers: {
    'user-agent': 'Logto (https://logto.io)',
    ...customHeaders,
    ...conditional(
      signingKey && { 'x-logto-signature-256': generateSignature(signingKey, payload) }
    ),
  },
  json: payload,
  retry: { limit: retries ?? 3 },
  timeout: { request: 10_000 },
});
