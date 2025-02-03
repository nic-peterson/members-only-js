require("dotenv").config();
const pool = require("../db/pool");

const Message = {
  create: async (title, content, authorId) => {
    const client = await pool.connect();
    try {
      const query =
        "INSERT INTO messages (title, content, author_id) VALUES ($1, $2, $3) RETURNING *";
      const result = await client.query(query, [title, content, authorId]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  findAll: async () => {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          messages.*,
          users.username as author_name
        FROM messages 
        LEFT JOIN users ON messages.author_id = users.id 
        ORDER BY created_at DESC
      `;
      const result = await client.query(query);
      return result.rows || [];
    } finally {
      client.release();
    }
  },
  findById: async (id) => {
    const client = await pool.connect();
    try {
      const query = "SELECT * FROM messages WHERE id = $1";
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
  delete: async (id) => {
    const client = await pool.connect();
    try {
      const query = "DELETE FROM messages WHERE id = $1 RETURNING *";
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
  findByAuthorId: async (authorId) => {
    const client = await pool.connect();
    try {
      const query = "SELECT * FROM messages WHERE author_id = $1";
      const result = await client.query(query, [authorId]);
      return result.rows || [];
    } finally {
      client.release();
    }
  },
};

module.exports = Message;
