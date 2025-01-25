require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

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
        ('Bob', 'Wilson', 'bob.wilson@example.com', $1, false, false),
        ('Alice', 'Johnson', 'alice.johnson@example.com', $1, true, true),
        ('Mike', 'Brown', 'mike.brown@example.com', $1, true, false)
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
        ('First Post', 'Hello, this is my first post!', $1),
        ('Welcome', 'Welcome to our platform!', $2),
        ('Tech Discussion', 'What programming languages do you use?', $1),
        ('Introduction', 'Hi everyone, I am new here', $3),
        ('Question', 'How does this platform work?', $2),
        ('Admin Update', 'Important platform updates coming soon!', $4),
        ('Member Discussion', 'Members-only content discussion', $5)
      RETURNING id, title, author_id;
    `,
      [users[0].id, users[1].id, users[2].id, users[3].id, users[4].id]
    );

    console.log("Seeded messages:", messagesResult.rows);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

// Run the seed function
seedDatabase();
