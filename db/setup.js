require("dotenv").config();
const pool = require("./pool");

const users = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_member BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const messages = `
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

async function setup() {
  console.log("Setting up database...");
  const client = await pool.connect();

  try {
    await client.query(users);
    await client.query(messages);
    console.log("Database setup complete.");
  } catch (error) {
    console.error("Setup error:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  setup().catch(console.error);
}

module.exports = setup;
