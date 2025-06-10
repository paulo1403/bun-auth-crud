import { Router } from 'express';
import jwt from 'jsonwebtoken';
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

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/:id', async (req, res) => {
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

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
