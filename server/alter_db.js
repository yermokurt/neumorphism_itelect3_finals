const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'postpal_db'
        });

        console.log("Connected to database. Running ALTER TABLE...");
        await connection.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;");
        console.log("Column profile_picture added successfully.");
        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error("Error altering DB:", error);
        }
    }
}
alterDb();
