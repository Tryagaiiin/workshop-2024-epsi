const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the users database.');
  });

  // Ask for an id to delete
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

readline.question('Enter the id of the user you want to delete: ', (id) => {
    // Define the SQL statement to delete a user
    const deleteSql = `DELETE FROM users WHERE id = ?`;
    
    // Execute the SQL statement to delete the user
    db.run(deleteSql, [id], (err) => {
        if (err) {
            return console.error('Error deleting user:', err.message);
        }
        console.log('User deleted successfully');
    });
    
    readline.close();
});