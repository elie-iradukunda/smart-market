import pool from '../config/database.js';

// ROLES CRUD
export const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO roles (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Role created' });
  } catch (error) {
    res.status(500).json({ error: 'Role creation failed' });
  }
};

export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute(`
      SELECT r.*, CAST(COUNT(u.id) AS UNSIGNED) AS usersCount
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      GROUP BY r.id, r.name, r.description
      ORDER BY r.name
    `);
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const getRole = async (req, res) => {
  try {
    const { id } = req.params;
    const [roles] = await pool.execute('SELECT * FROM roles WHERE id = ?', [id]);
    if (roles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(roles[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await pool.execute(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Role update failed' });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [id]);
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Role deletion failed' });
  }
};

// PERMISSIONS CRUD
export const createPermission = async (req, res) => {
  try {
    const { code, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO permissions (code, description) VALUES (?, ?)',
      [code, description]
    );
    res.status(201).json({ id: result.insertId, message: 'Permission created' });
  } catch (error) {
    res.status(500).json({ error: 'Permission creation failed' });
  }
};

export const getPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.execute('SELECT * FROM permissions ORDER BY code');
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

export const getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const [permissions] = await pool.execute('SELECT * FROM permissions WHERE id = ?', [id]);
    if (permissions.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.json(permissions[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description } = req.body;
    await pool.execute(
      'UPDATE permissions SET code = ?, description = ? WHERE id = ?',
      [code, description, id]
    );
    res.json({ message: 'Permission updated' });
  } catch (error) {
    res.status(500).json({ error: 'Permission update failed' });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM role_permissions WHERE permission_id = ?', [id]);
    await pool.execute('DELETE FROM permissions WHERE id = ?', [id]);
    res.json({ message: 'Permission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Permission deletion failed' });
  }
};

// ROLE PERMISSIONS CRUD
export const createRolePermission = async (req, res) => {
  try {
    const { role_id, permission_id } = req.body;
    await pool.execute(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [role_id, permission_id]
    );
    res.status(201).json({ message: 'Role permission created' });
  } catch (error) {
    res.status(500).json({ error: 'Role permission creation failed' });
  }
};

export const getRolePermissions = async (req, res) => {
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
};

export const getAllRolePermissions = async (req, res) => {
  try {
    const [rolePermissions] = await pool.execute(`
      SELECT rp.*, r.name as role_name, p.code as permission_code
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      ORDER BY r.name, p.code
    `);
    res.json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { permission_ids } = req.body;

    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [role_id]);

    if (permission_ids && permission_ids.length > 0) {
      for (const permission_id of permission_ids) {
        await pool.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role_id, permission_id]
        );
      }
    }

    res.json({ message: 'Role permissions updated' });
  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
};

export const deleteRolePermission = async (req, res) => {
  try {
    const { role_id, permission_id } = req.params;
    await pool.execute(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [role_id, permission_id]
    );
    res.json({ message: 'Role permission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Role permission deletion failed' });
  }
};