import pool from '../config/database.js';

export const createConversation = async (req, res) => {
  try {
    const { customer_id, channel } = req.body;
    
    // Check if customer exists
    const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check for existing conversation with same customer and channel
    const [existing] = await pool.execute(
      'SELECT id FROM conversations WHERE customer_id = ? AND channel = ? AND status = "open"',
      [customer_id, channel]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Active conversation already exists for this customer and channel' });
    }
    
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
      SELECT c.*, cu.name as customer_name 
      FROM conversations c 
      JOIN customers cu ON c.customer_id = cu.id 
      WHERE c.status = 'open' 
      ORDER BY c.id DESC
    `);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, attachments } = req.body;
    
    // Check if conversation exists
    const [conversation] = await pool.execute('SELECT id FROM conversations WHERE id = ?', [conversation_id]);
    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Convert attachments array to JSON string
    const attachmentsStr = attachments ? JSON.stringify(attachments) : null;
    
    await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, "staff", ?, ?)',
      [conversation_id, message, attachmentsStr]
    );
    
    res.json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Message sending failed' });
  }
};

export const receiveMessage = async (req, res) => {
  try {
    const { conversation_id, message, attachments } = req.body;
    
    // Check if conversation exists
    const [conversation] = await pool.execute('SELECT id FROM conversations WHERE id = ?', [conversation_id]);
    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Convert attachments array to JSON string
    const attachmentsStr = attachments ? JSON.stringify(attachments) : null;
    
    await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, "customer", ?, ?)',
      [conversation_id, message, attachmentsStr]
    );
    
    res.json({ message: 'Message received' });
  } catch (error) {
    res.status(500).json({ error: 'Message receiving failed' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    
    // Check if conversation exists
    const [conversation] = await pool.execute('SELECT id FROM conversations WHERE id = ?', [conversation_id]);
    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const [messages] = await pool.execute(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversation_id]
    );
    
    // Parse attachments JSON string back to array
    const parsedMessages = messages.map(msg => ({
      ...msg,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null
    }));
    
    res.json(parsedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};