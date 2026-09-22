import { Request, Response } from 'express';
import { pool } from '../../infrastructure/database/PoolConexion';

export function createHealthController() {
  async function check(req: Request, res: Response) {
    let dbStatus = 'ok';
    let statusCode = 200;

    try {
      await pool.execute('SELECT 1');
    } catch (e) {
      dbStatus = 'error';
      statusCode = 503;
    }

    const emailStatus = process.env.SMTP_USER ? 'ok' : 'missing_config';
    if (emailStatus !== 'ok') statusCode = 503;

    return res.status(statusCode).json({
      status: statusCode === 200 ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      db: dbStatus,
      email: emailStatus
    });
  }

  return { check };
}

