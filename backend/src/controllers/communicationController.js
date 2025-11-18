import pool from '../config/database.js';

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
    
    await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, "staff", ?, ?)',
      [conversation_id, message, attachments]
    );
    
    res.json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Message sending failed' });
  }
};

export const receiveMessage = async (req, res) => {
  try {
    const { conversation_id, message, attachments } = req.body;
    
    await pool.execute(
      'INSERT INTO messages (conversation_id, sender, message, attachments) VALUES (?, "customer", ?, ?)',
      [conversation_id, message, attachments]
    );
    
    res.json({ message: 'Message received' });
  } catch (error) {
    res.status(500).json({ error: 'Message receiving failed' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const [messages] = await pool.execute(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversation_id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};