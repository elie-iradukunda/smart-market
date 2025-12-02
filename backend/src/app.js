import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import socketService from './services/socketService.js';
import pool from './config/database.js';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import leadsRoutes from './routes/leads.js';
import quotesRoutes from './routes/quotes.js';
import inventoryRoutes from './routes/inventory.js';
import productionRoutes from './routes/production.js';
import financeRoutes from './routes/finance.js';
import marketingRoutes from './routes/marketing.js';
import communicationRoutes from './routes/communication.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';
import roleRoutes from './routes/roles.js';
import paymentRoutes from './routes/payments.js';
import productRoutes from './routes/products.js';
import productImageUploadRoutes from './routes/productImageUpload.js';
import ecommerceOrdersRoutes from './routes/ecommerceOrders.js';

import './jobs/scheduler.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Rate limiting – keep it for production, disable for local development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});

if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('public/uploads'));

// Direct campaign route (before other routes)
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [campaign] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );
    
    if (campaign.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Direct work-orders route
app.get('/api/work-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [workOrder] = await pool.execute(
      'SELECT * FROM work_orders WHERE id = ?',
      [id]
    );
    
    if (workOrder.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    res.json(workOrder[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// Direct roles route
app.get('/api/roles', async (req, res) => {
  try {
    const [roles] = await pool.execute('SELECT * FROM roles ORDER BY name');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Direct role by ID route
app.get('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [role] = await pool.execute(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    
    if (role.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(role[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create role route
app.post('/api/roles', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Role created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role route
app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await pool.execute(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role route
app.delete('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Permissions CRUD routes
app.get('/api/permissions', async (req, res) => {
  try {
    const [permissions] = await pool.execute('SELECT * FROM permissions ORDER BY code');
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

app.get('/api/permissions/:id', async (req, res) => {
  try {
    const { id} = req.params;
    const [permission] = await pool.execute('SELECT * FROM permissions WHERE id = ?', [id]);
    if (permission.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.json(permission[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
});

app.post('/api/permissions', async (req, res) => {
  try {
    const { code, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO permissions (code, description) VALUES (?, ?)',
      [code, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Permission created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

app.put('/api/permissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description } = req.body;
    await pool.execute(
      'UPDATE permissions SET code = ?, description = ? WHERE id = ?',
      [code, description, id]
    );
    res.json({ message: 'Permission updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

app.delete('/api/permissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM permissions WHERE id = ?', [id]);
    res.json({ message: 'Permission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete permission' });
  }
});

// Role-Permissions CRUD routes
app.get('/api/role-permissions', async (req, res) => {
  try {
    const [rolePermissions] = await pool.execute(`
      SELECT rp.*, r.name as role_name, p.code as permission_code
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
    `);
    res.json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

app.post('/api/role-permissions', async (req, res) => {
  try {
    const { role_id, permission_id } = req.body;
    await pool.execute(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [role_id, permission_id]
    );
    res.status(201).json({ message: 'Role permission created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role permission' });
  }
});

app.delete('/api/role-permissions/:role_id/:permission_id', async (req, res) => {
  try {
    const { role_id, permission_id } = req.params;
    await pool.execute(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [role_id, permission_id]
    );
    res.json({ message: 'Role permission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role permission' });
  }
});

// Get permissions for a specific role
app.get('/api/roles/:role_id/permissions', async (req, res) => {
  try {
    const { role_id } = req.params;
    const [permissions] = await pool.execute(`
      SELECT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.code
    `, [role_id]);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// Update permissions for a specific role
app.put('/api/roles/:role_id/permissions', async (req, res) => {
  try {
    const { role_id } = req.params;
    const { permission_ids } = req.body;
    
    // Delete existing permissions for this role
    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [role_id]);
    
    // Add new permissions
    for (const permission_id of permission_ids) {
      await pool.execute(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [role_id, permission_id]
      );
    }
    
    res.json({ message: 'Role permissions updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});

// Remove specific permission from role
app.delete('/api/roles/:role_id/permissions/:permission_id', async (req, res) => {
  try {
    const { role_id, permission_id } = req.params;
    await pool.execute(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [role_id, permission_id]
    );
    res.json({ message: 'Permission removed from role' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove permission from role' });
  }
});

// Issue materials to order
app.post('/api/orders/:id/issue-materials', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No materials provided to issue' });
    }

    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    for (const row of items) {
      if (!row) continue;
      const materialId = Number(row.material_id || row.materialId);
      const qty = Number(row.quantity || row.qty || 0);
      if (!materialId || !Number.isFinite(qty) || qty <= 0) continue;

      await pool.execute(
        'UPDATE materials SET current_stock = current_stock - ? WHERE id = ?',
        [qty, materialId]
      );

      await pool.execute(
        'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
        [materialId, 'issue', qty, `ORDER-${id}`, 1]
      );
    }

    res.json({ message: 'Materials issued for order' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue materials for order' });
  }
});

// Routes - E-commerce routes FIRST (before auth middleware)
app.use('/api/ecommerce/orders', ecommerceOrdersRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', productImageUploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', customerRoutes);
app.use('/api', leadsRoutes);
app.use('/api', quotesRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', productionRoutes);
app.use('/api', financeRoutes);
app.use('/api', marketingRoutes);
app.use('/api', communicationRoutes);
app.use('/api', aiRoutes);
app.use('/api', reportRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const server = createServer(app);
socketService.init(server);

server.listen(PORT, () => {
  console.log(`Smart Market Backend running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

export default app;
// Ready for orders