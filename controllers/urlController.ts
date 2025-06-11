import { prisma } from '../config/prisma';
import { nanoid } from 'nanoid';

export async function createUrlController(req: any, res: any) {
  const { originalUrl } = req.body;
  if (!originalUrl)
    return res.status(400).json({ error: 'originalUrl required' });
  const shortCode = nanoid(7);
  try {
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId: req.user.id,
      },
    });
    res.status(201).json(url);
  } catch (e) {
    res.status(400).json({ error: 'Could not create short URL' });
  }
}

export async function getUrlsController(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const search = req.query.search ? String(req.query.search) : '';
  const userId = req.user.id;

  const where: any = { userId };
  if (search) {
    where.OR = [
      { originalUrl: { contains: search, mode: 'insensitive' } },
      { shortCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [urls, total] = await Promise.all([
    prisma.url.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.url.count({ where }),
  ]);

  res.json({ urls, total });
}

export async function getUrlController(req: any, res: any) {
  const url = await prisma.url.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!url || url.userId !== req.user.id)
    return res.status(404).json({ error: 'URL not found' });
  res.json(url);
}

export async function updateUrlController(req: any, res: any) {
  const { originalUrl } = req.body;
  try {
    const url = await prisma.url.update({
      where: { id: Number(req.params.id) },
      data: { originalUrl },
    });
    if (url.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });
    res.json(url);
  } catch (e) {
    res.status(404).json({ error: 'URL not found' });
  }
}

export async function deleteUrlController(req: any, res: any) {
  try {
    const url = await prisma.url.delete({
      where: { id: Number(req.params.id) },
    });
    if (url.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'URL not found' });
  }
}

export async function redirectShortCodeController(req: any, res: any) {
  const url = await prisma.url.findUnique({
    where: { shortCode: req.params.shortCode },
  });
  if (!url) return res.status(404).json({ error: 'Short URL not found' });
  res.redirect(url.originalUrl);
}
