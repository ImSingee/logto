import { Logs } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { logConditionGuard } from '#src/queries/log.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function logRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { countLogs, findLogById, findLogs } = queries.logs;

  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: logConditionGuard,
      response: Logs.guard.omit({ tenantId: true }).array(),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const { query: logCondition } = ctx.guard;

      // TODO: @Gao refactor like user search
      const [{ count }, logs] = await Promise.all([
        countLogs(logCondition),
        findLogs(limit, offset, logCondition),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.get(
    '/logs/:id',
    koaGuard({ params: object({ id: string().min(1) }), response: Logs.guard, status: [200, 404] }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findLogById(id);

      return next();
    }
  );
}
