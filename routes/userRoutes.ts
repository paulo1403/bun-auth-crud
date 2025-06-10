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

router.post('/login', async (req: AuthRequest, res) => {
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
});

router.post('/users', authenticateToken, requireAdmin, createUserController);

router.get('/users', async (req: any, res: any) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get('/users/:id', async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/:id', async (req: any, res: any) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email },
    });
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'User not found or email not unique' });
  }
});

router.delete('/users/:id', async (req: any, res: any) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req: any, res: any) => {
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
});

// POST /reset-password
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
