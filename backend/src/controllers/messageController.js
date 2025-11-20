import pool from '../config/database.js';
// import { getIO } from '../services/websocketService.js';

export const createConversation = async (req, res) => {
  try {
    const { customer_id, channel } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO conversations (customer_id, channel) VALUES (?, ?)',
      [customer_id, channel]
    );
    res.status(201).json({ id: result.insertId, message: 'Conversation created' });
  } catch (error) {
    res.status(500).json({ error: 'Conversation creation failed' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const [conversations] = await pool.execute(`
      SELECT c.*, cu.name as customer_name, cu.phone, cu.email,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender = 'customer') as unread_count,
        (SELECT message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.timestamp DESC LIMIT 1) as last_message,
        (SELECT timestamp FROM messages m WHERE m.conversation_id = c.id ORDER BY m.timestamp DESC LIMIT 1) as last_message_time
      FROM conversations c
      JOIN customers cu ON c.customer_id = cu.id
      ORDER BY last_message_time DESC
    `);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const [conversation] = await pool.execute(`
      SELECT c.*, cu.name as customer_name, cu.phone, cu.email
      FROM conversations c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = ?
    `, [id]);
    
    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const [messages] = await pool.execute(`
      SELECT m.*, u.name as staff_name
      FROM messages m
      LEFT JOIN users u ON m.sender = 'staff' AND u.id = ?
      WHERE m.conversation_id = ?
      ORDER BY m.timestamp ASC
    `, [req.user?.userId, conversation_id]);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, attachments } = req.body;
    const sender = 'staff';
    
    // Check if conversation exists
    const [conversation] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ?', 
      [conversation_id]
    );
    
    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Insert message
    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, ?, ?, ?)',
      [conversation_id, sender, message, attachments || null]
    );
    
    // Get the complete message with sender info
    const [newMessage] = await pool.execute(`
      SELECT m.*, u.name as staff_name, c.customer_id
      FROM messages m
      LEFT JOIN users u ON u.id = ?
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = ?
    `, [req.user.userId, result.insertId]);
    
    // Emit to WebSocket clients
    // try {
    //   const io = getIO();
    //   io.to(`conversation_${conversation_id}`).emit('new_message', newMessage[0]);
    //   io.to(`customer_${conversation[0].customer_id}`).emit('new_message', newMessage[0]);
    // } catch (error) {
    //   console.log('WebSocket not available for message broadcast');
    // }
    
    res.status(201).json({ id: result.insertId, message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Message sending failed' });
  }
};

export const receiveMessage = async (req, res) => {
  try {
    const { conversation_id, message, attachments, customer_phone } = req.body;
    
    // Find or create conversation by customer phone
    let conversationId = conversation_id;
    
    if (!conversationId && customer_phone) {
      const [customer] = await pool.execute(
        'SELECT id FROM customers WHERE phone = ?',
        [customer_phone]
      );
      
      if (customer.length > 0) {
        const [existingConv] = await pool.execute(
          'SELECT id FROM conversations WHERE customer_id = ? AND status = "open"',
          [customer[0].id]
        );
        
        if (existingConv.length > 0) {
          conversationId = existingConv[0].id;
        } else {
          const [newConv] = await pool.execute(
            'INSERT INTO conversations (customer_id, channel) VALUES (?, ?)',
            [customer[0].id, 'whatsapp']
          );
          conversationId = newConv.insertId;
        }
      }
    }
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation not found or created' });
    }
    
    // Insert customer message
    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, ?, ?, ?)',
      [conversationId, 'customer', message, attachments || null]
    );
    
    // Get conversation details
    const [conversation] = await pool.execute(`
      SELECT c.*, cu.name as customer_name
      FROM conversations c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = ?
    `, [conversationId]);
    
    const messageData = {
      id: result.insertId,
      conversation_id: conversationId,
      sender: 'customer',
      message,
      attachments,
      timestamp: new Date(),
      customer_name: conversation[0]?.customer_name
    };
    
    // Emit to WebSocket clients (staff)
    // try {
    //   const io = getIO();
    //   io.emit('new_customer_message', messageData);
    // } catch (error) {
    //   console.log('WebSocket not available for message broadcast');
    // }
    
    res.status(201).json({ id: result.insertId, message: 'Message received' });
  } catch (error) {
    console.error('Receive message error:', error);
    res.status(500).json({ error: 'Message receiving failed' });
  }
};

export const closeConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE conversations SET status = "closed" WHERE id = ?',
      [id]
    );
    res.json({ message: 'Conversation closed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close conversation' });
  }
};