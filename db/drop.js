require("dotenv").config();
const { Client } = require("pg");

async function dropTables() {
  console.log("Dropping tables...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const queries = [
    "DROP TABLE IF EXISTS messages;",
    "DROP TABLE IF EXISTS users;",
  ];

  for (const query of queries) {
    await client.query(query);
  }

  await client.end();

  console.log("Tables dropped.");
}

dropTables();
