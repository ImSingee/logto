import { HookEvent, type HookEventPayload } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockSignature = 'mock-signature';
const { generateSignature } = mockEsm('#src/utils/signature.js', () => ({
  generateSignature: jest.fn().mockReturnValue(mockSignature),
}));

const { createHookRequestOptions } = await import('#src/libraries/hook/utils.js');

describe('createHookRequestOptions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call generateSignature with correct values', () => {
    const signingKey = 'mock-signing-key';
    const payload: HookEventPayload = {
      hookId: 'hookId',
      event: HookEvent.PostSignIn,
      createdAt: '123456',
    };

    createHookRequestOptions({ signingKey, payload });

    expect(generateSignature).toBeCalledWith(signingKey, payload);
  });

  it('should create correct hook request options', () => {
    const signingKey = 'mock-signing-key';
    const payload: HookEventPayload = {
      hookId: 'hookId',
      event: HookEvent.PostSignIn,
      createdAt: '123456',
    };

    const customHeaders = {
      'x-custom-header': 'custom-header',
      'x-logto-signature-256': 'custom-signature',
    };

    const options = createHookRequestOptions({ signingKey, payload, customHeaders });

    expect(options).toEqual({
      headers: {
        'user-agent': 'Logto (https://logto.io)',
        'x-custom-header': 'custom-header',
        'x-logto-signature-256': mockSignature,
      },
      json: payload,
      retry: { limit: 3 },
      timeout: { request: 10_000 },
    });
  });

  it('ensure the x-logto-signature-256 header is not set when signingKey is not provided', () => {
    const signingKey = '';
    const payload: HookEventPayload = {
      hookId: 'hookId',
      event: HookEvent.PostSignIn,
      createdAt: '123456',
    };

    const options = createHookRequestOptions({ signingKey, payload });

    expect(options).toBeTruthy();
    expect(options.headers).not.toHaveProperty('x-logto-signature-256');
  });

  it('ensure the reserved x-logto-signature-256 header will not be overridden', () => {
    const signingKey = 'mock-signing-key';
    const payload: HookEventPayload = {
      hookId: 'hookId',
      event: HookEvent.PostSignIn,
      createdAt: '123456',
    };

    const customHeaders = {
      'x-logto-signature-256': 'custom-signature',
    };

    const options = createHookRequestOptions({ signingKey, payload, customHeaders });

    expect(options).toBeTruthy();
    expect(options.headers).toHaveProperty('x-logto-signature-256', mockSignature);
  });
});
