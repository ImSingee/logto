import { LogResult } from '@logto/schemas';
import type { Log } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { type LogCondition } from '#src/queries/log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockBody = { key: 'a', payload: { key: 'a', result: LogResult.Success }, createdAt: 123 };
const mockLog: Log = { tenantId: 'fake_tenant', id: '1', ...mockBody };
const mockLogs = [mockLog, { id: '2', ...mockBody }];

const logs = {
  countLogs: jest.fn().mockResolvedValue({
    count: mockLogs.length,
  }),
  findLogs: jest.fn().mockResolvedValue(mockLogs),
  findLogById: jest.fn().mockResolvedValue(mockLog),
};
const { countLogs, findLogs, findLogById } = logs;
const logRoutes = await pickDefault(import('./log.js'));

describe('logRoutes', () => {
  const logRequest = createRequester({
    authedRoutes: logRoutes,
    tenantContext: new MockTenant(undefined, { logs }),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /logs', () => {
    it('should call countLogs and findLogs with correct parameters', async () => {
      const logCondition: LogCondition = {
        userId: 'userIdValue',
        applicationId: 'foo',
        logKey: 'SignInUsernamePassword',
        hookId: 'hookIdValue',
        result: LogResult.Success,
        startTimeExclusive: '123',
        endTimeInclusive: '456',
      };

      const pagination = {
        page: 1,
        pageSize: 5,
      };

      const queryString = new URLSearchParams({
        ...logCondition,
        page: String(pagination.page),
        page_size: String(pagination.pageSize),
      }).toString();

      await logRequest.get(`/logs?${queryString}`);

      expect(countLogs).toHaveBeenCalledWith(logCondition);
      expect(findLogs).toHaveBeenCalledWith(pagination.pageSize, pagination.page - 1, logCondition);
    });

    it('should return correct response', async () => {
      const response = await logRequest.get(`/logs`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLogs);
      expect(response.header).toHaveProperty('total-number', `${mockLogs.length}`);
    });
  });

  describe('GET /logs/:id', () => {
    const logId = 'logIdValue';

    it('should call findLogById with correct parameters', async () => {
      await logRequest.get(`/logs/${logId}`);
      expect(findLogById).toHaveBeenCalledWith(logId);
    });

    it('should return correct response', async () => {
      const response = await logRequest.get(`/logs/${logId}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLog);
    });
  });
});
