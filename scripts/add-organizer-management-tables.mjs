import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("Creating emailTemplates table...");
await connection.execute(`
  CREATE TABLE IF NOT EXISTS emailTemplates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category ENUM('welcome', 'clarification', 'rejection', 'general', 'reminder', 'announcement') DEFAULT 'general' NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  )
`);

console.log("Creating organizerNotes table...");
await connection.execute(`
  CREATE TABLE IF NOT EXISTS organizerNotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizerId INT NOT NULL,
    adminId INT NOT NULL,
    note TEXT NOT NULL,
    isFlagged INT DEFAULT 0 NOT NULL,
    flagReason TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  )
`);

console.log("✅ Tables created successfully!");

await connection.end();
