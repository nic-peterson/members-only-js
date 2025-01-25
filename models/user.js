require("dotenv").config();
const { Client } = require("pg");

const User = {
  create: async (username, password, firstName, lastName) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query =
      "INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *";
    const result = await client.query(query, [
      username,
      password,
      firstName,
      lastName,
    ]);

    await client.end();

    return result.rows[0];
  },

  findByUsername: async (username) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [username]);

    await client.end();

    return result.rows[0] || null;
  },

  findById: async (id) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "SELECT * FROM users WHERE id = $1";
    const result = await client.query(query, [id]);

    await client.end();

    return result.rows[0] || null;
  },

  isMember: async (username) => {
    const user = await User.findByUsername(username);
    return user.is_member;
  },

  setMembershipStatus: async (username, isMember) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "UPDATE users SET is_member = $1 WHERE username = $2";
    await client.query(query, [isMember, username]);

    await client.end();
  },

  isAdmin: async (username) => {
    const user = await User.findByUsername(username);
    return user.is_admin;
  },

  setAdminStatus: async (username, isAdmin) => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    const query = "UPDATE users SET is_admin = $1 WHERE username = $2";
    await client.query(query, [isAdmin, username]);

    await client.end();
  },
};

module.exports = User;
