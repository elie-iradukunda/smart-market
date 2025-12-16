import pool from './src/config/database.js';

(async () => {
  try {
    const [userPerms] = await pool.execute('SELECT code FROM permissions WHERE code LIKE "user.%" ORDER BY code');
    console.log('User permissions:', userPerms.map(p => p.code));

    const [rolePerms] = await pool.execute('SELECT code FROM permissions WHERE code LIKE "role.%" ORDER BY code');
    console.log('Role permissions:', rolePerms.map(p => p.code));

    const [roleManage] = await pool.execute('SELECT code FROM permissions WHERE code = "role.manage"');
    console.log('Role manage permission:', roleManage.length > 0 ? roleManage[0].code : 'NOT FOUND');

    const [userManage] = await pool.execute('SELECT code FROM permissions WHERE code = "user.manage"');
    console.log('User manage permission:', userManage.length > 0 ? userManage[0].code : 'NOT FOUND');

    const [allPerms] = await pool.execute('SELECT COUNT(*) as count FROM permissions');
    console.log('Total permissions:', allPerms[0].count);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
