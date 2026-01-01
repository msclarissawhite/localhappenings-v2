import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  // Check and add phone column
  const [phoneColumns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'organizers' 
    AND COLUMN_NAME = 'phone'
  `);

  if (phoneColumns.length === 0) {
    console.log("Adding phone column...");
    await connection.execute(`
      ALTER TABLE organizers 
      ADD COLUMN phone VARCHAR(50) 
      AFTER email
    `);
    console.log("✅ phone column added");
  } else {
    console.log("✅ phone column exists");
  }

  // Check and add website column
  const [websiteColumns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'organizers' 
    AND COLUMN_NAME = 'website'
  `);

  if (websiteColumns.length === 0) {
    console.log("Adding website column...");
    await connection.execute(`
      ALTER TABLE organizers 
      ADD COLUMN website TEXT 
      AFTER phone
    `);
    console.log("✅ website column added");
  } else {
    console.log("✅ website column exists");
  }

  console.log("\n✅ All organizer columns are ready!");
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
} finally {
  await connection.end();
}
