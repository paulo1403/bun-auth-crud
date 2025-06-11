import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import {
  loginController,
  createUserController,
} from '../controllers/userController';
import { prisma } from '../config/prisma';
import type { AuthRequest } from '../types/express';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const rateLimitMap = new Map<string, { count: number; last: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function rateLimitMiddleware(keyFn: (req: any) => string) {
  return (req: any, res: any, next: any) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = rateLimitMap.get(key) || { count: 0, last: now };
    if (now - entry.last > RATE_LIMIT_WINDOW) {
      entry.count = 0;
      entry.last = now;
    }
    entry.count++;
    rateLimitMap.set(key, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return res
        .status(429)
        .json({ error: 'Demasiados intentos, espera un minuto.' });
    }
    next();
  };
}

function logAction(action: string, details: any, req: any) {
  const user = req.user ? `${req.user.email} (id:${req.user.id})` : 'anon';
  const log = {
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
    ip: req.ip,
  };
  // Aquí solo console.log, pero podrías guardar en archivo o base de datos
  console.log('[AUDIT]', JSON.stringify(log));
}

router.post(
  '/login',
  rateLimitMiddleware((req) => req.ip),
  rateLimitMiddleware((req) => req.body.email || ''),
  async (req: AuthRequest, res) => {
    const result = await loginController(req, res);
    if (result === null) {
      const user = req.authUser;
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    }
  }
);

router.post(
  '/users',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res
        .status(400)
        .json({ error: 'Name, email, password and role required' });
    try {
      const hashedPassword = require('bcryptjs').hashSync(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });
      const { password: _, ...userWithoutPassword } = user;
      logAction('create_user', { user: userWithoutPassword }, req);
      res.status(201).json(userWithoutPassword);
    } catch (e) {
      res.status(400).json({ error: 'Email must be unique' });
    }
  }
);

router.get(
  '/users',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    const users = await prisma.user.findMany();
    res.json(users);
  }
);

router.get(
  '/users/:id',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }
);

router.put(
  '/users/:id',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    const { name, email, role, password } = req.body;
    try {
      const data: any = { name, email, role };
      if (password) {
        const bcrypt = require('bcryptjs');
        data.password = bcrypt.hashSync(password, 10);
      }
      const user = await prisma.user.update({
        where: { id: Number(req.params.id) },
        data,
      });
      const { password: _, ...userWithoutPassword } = user;
      logAction('edit_user', { user: userWithoutPassword }, req);
      res.json(userWithoutPassword);
    } catch (e) {
      res.status(404).json({ error: 'User not found or email not unique' });
    }
  }
);

router.delete(
  '/users/:id',
  authenticateToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      await prisma.user.delete({ where: { id: Number(req.params.id) } });
      logAction('delete_user', { userId: req.params.id }, req);
      res.status(204).send();
    } catch (e) {
      res.status(404).json({ error: 'User not found' });
    }
  }
);

router.post(
  '/forgot-password',
  rateLimitMiddleware((req) => req.ip),
  rateLimitMiddleware((req) => req.body.email || ''),
  async (req: any, res: any) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    // En producción se enviaría por email. Aquí lo devolvemos para pruebas
    res.json({ resetToken: token, expires: expiry });
  }
);

router.post('/reset-password', async (req: any, res: any) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: 'Token and new password required' });
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  const hashedPassword = require('bcryptjs').hashSync(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  res.json({ message: 'Password updated' });
});

export default router;
