require("dotenv").config();
const { Client } = require("pg");

const Message = {
  create: async (title, content, authorId) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query =
      "INSERT INTO messages (title, content, author_id) VALUES ($1, $2, $3) RETURNING *";
    const result = await client.query(query, [title, content, authorId]);

    await client.end();

    return result.rows[0];
  },
  findAll: async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = `
      SELECT 
        messages.*,
        users.username as author_name
      FROM messages 
      LEFT JOIN users ON messages.author_id = users.id 
      ORDER BY created_at DESC
    `;
    const result = await client.query(query);

    await client.end();

    return result.rows || [];
  },
  findById: async (id) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "SELECT * FROM messages WHERE id = $1";
    const result = await client.query(query, [id]);

    await client.end();

    return result.rows[0] || null;
  },
  delete: async (id) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "DELETE FROM messages WHERE id = $1 RETURNING *";
    const result = await client.query(query, [id]);

    await client.end();

    return result.rows[0] || null;
  },
  findByAuthorId: async (authorId) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "SELECT * FROM messages WHERE author_id = $1";
    const result = await client.query(query, [authorId]);

    await client.end();

    return result.rows || [];
  },
};

module.exports = Message;
