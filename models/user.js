require("dotenv").config();
const pool = require("../db/pool");

const User = {
  create: async (username, password, firstName, lastName) => {
    const client = await pool.connect();
    try {
      const query =
        "INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *";
      const result = await client.query(query, [
        username,
        password,
        firstName,
        lastName,
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  findByUsername: async (username) => {
    const client = await pool.connect();
    try {
      const query = "SELECT * FROM users WHERE username = $1";
      const result = await client.query(query, [username]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  findById: async (id) => {
    const client = await pool.connect();
    try {
      const query = "SELECT * FROM users WHERE id = $1";
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  isMember: async (username) => {
    const user = await User.findByUsername(username);
    return user.is_member;
  },

  setMembershipStatus: async (username, status) => {
    const client = await pool.connect();
    try {
      const query =
        "UPDATE users SET is_member = $1 WHERE username = $2 RETURNING *";
      const result = await client.query(query, [status, username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  isAdmin: async (username) => {
    const user = await User.findByUsername(username);
    return user.is_admin;
  },

  setAdminStatus: async (username, status) => {
    const client = await pool.connect();
    try {
      const query =
        "UPDATE users SET is_admin = $1 WHERE username = $2 RETURNING *";
      const result = await client.query(query, [status, username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};

module.exports = User;
