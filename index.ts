const express = require('express');
const { PrismaClient } = require('./generated/prisma');

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
}

let users: User[] = [];
let nextId = 1;

app.get('/users', async (req: any, res: any) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/users', async (req: any, res: any) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email required' });
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: 'Email must be unique' });
  }
});

app.put('/users/:id', async (req: any, res: any) => {
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

app.delete('/users/:id', async (req: any, res: any) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
