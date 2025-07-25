import { Router, Request, Response } from 'express';
import config from '../config';

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

const router = Router();

// Legacy endpoints with deprecation warnings
router.get('/users', async (req: Request, res: Response) => {
  logWithMeta('Legacy /users endpoint accessed', {
    func: '/users',
    level: 'warn',
    extra: {
      deprecationWarning:
        'This endpoint is deprecated. Use /api/v1/users instead.',
    },
  });

  res.status(410).json({
    status: 'deprecated',
    message: 'This endpoint has been moved to a dedicated user service.',
    newEndpoint: `${config.services.userService}/api/v1/users`,
    deprecationDate: '2025-01-01',
    documentation: 'Please migrate to the new user service API.',
  });
});

export default router;