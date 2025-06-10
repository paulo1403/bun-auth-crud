import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  createUrlController,
  getUrlsController,
  getUrlController,
  updateUrlController,
  deleteUrlController,
  redirectShortCodeController,
} from '../controllers/urlController';

const router = Router();

// CRUD de URLs (requiere autenticación)
router.post('/urls', authenticateToken, createUrlController);
router.get('/urls', authenticateToken, getUrlsController);
router.get('/urls/:id', authenticateToken, getUrlController);
router.put('/urls/:id', authenticateToken, updateUrlController);
router.delete('/urls/:id', authenticateToken, deleteUrlController);

// Redirección pública
router.get('/:shortCode', redirectShortCodeController);

export default router;
