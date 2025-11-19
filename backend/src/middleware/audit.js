import pool from '../config/database.js';

export const auditLog = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode < 400 && req.user) {
        const recordId = JSON.parse(data)?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        pool.execute(
          'INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, action, tableName, recordId, ipAddress]
        ).catch(console.error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};