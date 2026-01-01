import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  // Check if organizerType column exists
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'organizers' 
    AND COLUMN_NAME = 'organizerType'
  `);

  if (columns.length === 0) {
    console.log("organizerType column not found. Adding it now...");
    
    // Add the column
    await connection.execute(`
      ALTER TABLE organizers 
      ADD COLUMN organizerType ENUM('business', 'nonprofit', 'community', 'municipality', 'school-library', 'other') 
      AFTER email
    `);
    
    console.log("✅ organizerType column added successfully!");
  } else {
    console.log("✅ organizerType column already exists.");
  }
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
} finally {
  await connection.end();
}
