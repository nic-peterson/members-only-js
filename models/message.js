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
  findAll: async () => {},
  findById: async (id) => {},
  delete: async (id) => {},
  findByAuthorId: async (authorId) => {},
};

module.exports = Message;
