const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the users database.');
  });

// Define the SQL statement to create a table
const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        score SMALLINT NOT NULL
    )`;

// Execute the SQL statement to create the table
db.run(createTableSql, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('Table created successfully');
});