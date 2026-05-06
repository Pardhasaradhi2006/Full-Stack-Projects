const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "VTU26578@",        // Add your MySQL password here if set
  database: "event",
  port: 3306      // Change to 3307 if using XAMPP with custom port
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

module.exports = connection;
