import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { prisma } from '../config/prisma';

const router = Router();

// Endpoint para consultar logs de auditoría
router.get(
  '/audit-logs',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? String(req.query.search) : '';
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;
    const user = req.query.user ? String(req.query.user) : '';
    const action = req.query.action ? String(req.query.action) : '';

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { ip: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (user) {
      where.user = { contains: user, mode: 'insensitive' };
    }
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ logs, total });
  }
);

export default router;
