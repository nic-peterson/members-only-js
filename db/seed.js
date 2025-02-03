require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./pool");

async function seedDatabase() {
  const client = await pool.connect();
  try {
    // Generate hashed password
    const SALT_ROUNDS = 10;
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Clear existing data
    await client.query("TRUNCATE users, messages CASCADE");

    // Seed users with different roles
    const usersResult = await client.query(
      `
      INSERT INTO users (first_name, last_name, username, password, is_member, is_admin) 
      VALUES 
        ('John', 'Doe', 'john.doe@example.com', $1, true, true),
        ('Jane', 'Smith', 'jane.smith@example.com', $1, true, false),
        ('Bob', 'Wilson', 'bob.wilson@example.com', $1, false, false)
      RETURNING id, first_name, last_name, username, is_member, is_admin;
    `,
      [hashedPassword]
    );

    const users = usersResult.rows;
    console.log("Seeded users:", users);

    // Seed messages
    const messagesResult = await client.query(
      `
      INSERT INTO messages (title, content, author_id) 
      VALUES 
        ('Welcome', 'Welcome to Members Only!', $1),
        ('Member Post', 'This is a member-only post', $2),
        ('Public Post', 'This is visible to everyone', $3)
      RETURNING id, title, author_id;
    `,
      [users[0].id, users[1].id, users[2].id]
    );

    console.log("Seeded messages:", messagesResult.rows);
  } finally {
    client.release();
  }
}

// Run the seed function
seedDatabase().catch(console.error);
