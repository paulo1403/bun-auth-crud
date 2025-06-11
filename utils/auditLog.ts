import { prisma } from '../config/prisma';

export async function logAction(action: string, details: any, req: any) {
  const user = req.user ? `${req.user.email} (id:${req.user.id})` : 'anon';
  const log = {
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
    ip: req.ip,
  };
  try {
    await prisma.auditLog.create({
      data: {
        user,
        action,
        details: JSON.stringify(details),
        ip: req.ip || '',
      },
    });
  } catch (e) {
    console.error('Error guardando log de auditoría:', e);
  }
  console.log('[AUDIT]', JSON.stringify(log));
}
