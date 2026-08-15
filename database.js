require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MySQL Connected Successfully!");

    const [rows] = await connection.query("SELECT DATABASE() AS database_name");

    console.log("Connected Database:", rows[0].database_name);

    connection.release();

  } catch (error) {
    console.error("❌ MySQL Connection Failed:");
    console.error(error.message);
  }
}

testConnection();

module.exports = pool;