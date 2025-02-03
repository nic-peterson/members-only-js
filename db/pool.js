const { Pool } = require("pg");

// Configure SSL based on environment
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

const pool = new Pool(poolConfig);
console.log("Pool created with config:", poolConfig);
module.exports = pool;
