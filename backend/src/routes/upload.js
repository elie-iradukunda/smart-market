import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import pool from '../config/database.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

router.post('/upload/artwork', upload.single('artwork'), async (req, res) => {
  try {
    const { quote_id, order_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file_url = req.file.path;
    
    const [result] = await pool.execute(
      'INSERT INTO artwork_files (quote_id, order_id, file_url) VALUES (?, ?, ?)',
      [quote_id || null, order_id || null, file_url]
    );
    
    res.json({ id: result.insertId, file_url, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

router.get('/files/:id', async (req, res) => {
  try {
    const [files] = await pool.execute('SELECT * FROM artwork_files WHERE id = ?', [req.params.id]);
    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(files[0].file_url, { root: '.' });
  } catch (error) {
    res.status(500).json({ error: 'File retrieval failed' });
  }
});

export default router;