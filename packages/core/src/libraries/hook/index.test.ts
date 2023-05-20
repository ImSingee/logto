import {
  type HookEventPayload,
  HookEvent,
  InteractionEvent,
  LogResult,
  type Application,
  ApplicationType,
  type userInfoSelectFields,
  type User,
  type Hook,
} from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { got } from 'got';

import type { Interaction } from './index.js';
import { parseResponse } from './utils.js';

const { jest } = import.meta;
const { mockEsmWithActual, mockEsm } = createMockUtils(jest);

const nanoIdMock = 'mockId';
await mockEsmWithActual('@logto/shared', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: () => () => nanoIdMock,
  generateStandardId: () => nanoIdMock,
}));

const mockUserAgent = 'Mock User Agent';

const mockApplication: Pick<Application, 'id' | 'type' | 'name' | 'description'> = {
  id: 'app_id',
  type: ApplicationType.Traditional,
  name: 'app_name',
  description: 'Mock Application For Test',
};

const mockUser: {
  [K in (typeof userInfoSelectFields)[number]]: User[K];
} = {
  id: 'user_id',
  name: 'user_name',
  username: 'user',
  primaryEmail: null,
  primaryPhone: null,
  avatar: null,
  customData: {},
  identities: {},
  lastSignInAt: null,
  createdAt: new Date(100_000).getTime(),
  applicationId: 'app_id',
  isSuspended: false,
};

const url = 'https://logto.gg';
const mockEvent = HookEvent.PostSignIn;
const hook: Hook = {
  tenantId: 'bar',
  id: 'foo',
  name: 'hook_name',
  event: mockEvent,
  events: [mockEvent],
  signingKey: 'signing_key',
  enabled: true,
  config: { headers: { bar: 'baz' }, url, retries: 3 },
  createdAt: Date.now() / 1000,
};

const mockHookEventPayload: HookEventPayload = {
  hookId: hook.id,
  event: mockEvent,
  interactionEvent: 'SignIn',
  createdAt: new Date(100_000).toISOString(),
  sessionId: 'some_jti',
  userAgent: 'Mock User Agent',
  userId: '123',
  user: mockUser,
  application: mockApplication,
};

const mockHookRequestOptions = {
  headers: {
    'user-agent': 'Logto (https://logto.io)',
    'x-logto-signature-256': 'mock_signature',
  },
  json: mockHookEventPayload,
  retry: { limit: 3 },
  timeout: { request: 10_000 },
};

mockEsm('./utils.js', () => ({
  parseResponse,
  createHookRequestOptions: jest.fn(() => mockHookRequestOptions),
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');

const post = jest
  .spyOn(got, 'post')
  // @ts-expect-error
  .mockImplementation(jest.fn(async () => ({ statusCode: 200, body: '{"message":"ok"}' })));

const insertLog = jest.fn();
const findAllHooks = jest.fn().mockResolvedValue([hook]);

const { createHookLibrary } = await import('./index.js');
const { triggerInteractionHooksIfNeeded } = createHookLibrary(
  new MockQueries({
    // @ts-expect-error
    users: { findUserById: () => mockUser },
    applications: {
      // @ts-expect-error
      findApplicationById: async () => mockApplication,
    },
    logs: { insertLog },
    hooks: { findAllHooks },
  })
);

describe('triggerInteractionHooksIfNeeded()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return if no user ID found', async () => {
    await triggerInteractionHooksIfNeeded(InteractionEvent.SignIn);

    expect(findAllHooks).not.toBeCalled();
  });

  it('should set correct payload when hook triggered', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    await triggerInteractionHooksIfNeeded(
      InteractionEvent.SignIn,
      // @ts-expect-error
      {
        jti: 'some_jti',
        result: { login: { accountId: '123' } },
        params: { client_id: 'some_client' },
      } as Interaction,
      mockUserAgent
    );

    expect(findAllHooks).toHaveBeenCalled();
    expect(post).toHaveBeenCalledWith(url, mockHookRequestOptions);
    const calledPayload: unknown = insertLog.mock.calls[0][0];
    expect(calledPayload).toHaveProperty('id', nanoIdMock);
    expect(calledPayload).toHaveProperty('key', 'TriggerHook.' + mockEvent);
    expect(calledPayload).toHaveProperty('payload.result', LogResult.Success);
    expect(calledPayload).toHaveProperty('payload.hookId', hook.id);
    expect(calledPayload).toHaveProperty('payload.json.event', mockHookEventPayload.event);
    expect(calledPayload).toHaveProperty('payload.json.interactionEvent', InteractionEvent.SignIn);
    expect(calledPayload).toHaveProperty('payload.json.hookId', mockHookEventPayload.hookId);
    expect(calledPayload).toHaveProperty('payload.json.userId', mockHookEventPayload.userId);
    expect(calledPayload).toHaveProperty('payload.response.statusCode', 200);
    expect(calledPayload).toHaveProperty('payload.response.body.message', 'ok');
    jest.useRealTimers();
  });
});
