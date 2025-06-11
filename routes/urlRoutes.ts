import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { prisma } from '../config/prisma';
import {
  createUrlController,
  getUrlsController,
  getUrlController,
  updateUrlController,
  deleteUrlController,
  redirectShortCodeController,
} from '../controllers/urlController';
import { logAction } from '../utils/auditLog';

const router = Router();

router.post('/urls', authenticateToken, async (req: any, res: any) => {
  try {
    const shortCode = require('nanoid').nanoid(7);
    const url = await prisma.url.create({
      data: {
        originalUrl: req.body.originalUrl,
        shortCode,
        userId: req.user.id,
      },
    });
    logAction('create_url', { url }, req);
    res.status(201).json(url);
  } catch (e) {
    res.status(400).json({ error: 'Could not create short URL' });
  }
});
router.get('/urls', authenticateToken, getUrlsController);
router.get('/urls/:id', authenticateToken, getUrlController);

router.put('/urls/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const url = await prisma.url.update({
      where: { id: Number(req.params.id) },
      data: { originalUrl: req.body.originalUrl },
    });
    if (url.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });
    logAction('edit_url', { url }, req);
    res.json(url);
  } catch (e) {
    res.status(404).json({ error: 'URL not found' });
  }
});

router.delete('/urls/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const url = await prisma.url.delete({
      where: { id: Number(req.params.id) },
    });
    if (url.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });
    logAction('delete_url', { urlId: req.params.id }, req);
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'URL not found' });
  }
});

// Todas las rutas protegidas y de API arriba

// Esta ruta solo debe usarse cuando el router está montado en /s
router.get('/:shortCode', redirectShortCodeController);

export default router;
