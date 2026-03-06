// db.js — MySQL database connection using mysql2
const mysql = require('mysql2');

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postpal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promisify the pool so we can use async/await
const db = pool.promise();

module.exports = db;
