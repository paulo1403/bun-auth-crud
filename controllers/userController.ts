import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

export async function loginController(req: any, res: any) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password)
    return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  // El token se genera en la ruta
  req.authUser = user;
  return null;
}

export async function createUserController(req: any, res: any) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res
      .status(400)
      .json({ error: 'Name, email, password and role required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: 'Email must be unique' });
  }
}
