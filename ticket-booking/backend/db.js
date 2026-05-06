import mysql from 'mysql2/promise';

let pool;

export const initDb = async () => {
    // Connect to server generic to ensure database exists
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'VTU26578@'
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS ticket_booking');
    await connection.end();

    // Create persistent connection pool
    pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'VTU26578@',
        database: 'ticket_booking',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Create Users Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255),
            mobile VARCHAR(50),
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'User'
        )
    `);

    // Create Events Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            department VARCHAR(255) NOT NULL,
            date VARCHAR(255) NOT NULL,
            venue VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            availableTickets INT NOT NULL
        )
    `);

    // Create Bookings Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            eventId INT NOT NULL,
            userName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            department VARCHAR(255) NOT NULL,
            ticketsBooked INT NOT NULL,
            totalAmount DECIMAL(10, 2) NOT NULL,
            paymentStatus VARCHAR(100) DEFAULT 'Completed',
            FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
        )
    `);

    // Seed Events
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events');
    if (eventCount[0].count === 0) {
        await pool.query(
            'INSERT INTO events (name, department, date, venue, price, availableTickets) VALUES (?, ?, ?, ?, ?, ?)',
            ['Tech Symposium 2026', 'Computer Science', 'May 15, 2026 | 09:00 AM', 'University Main Auditorium', 25, 50]
        );
    }
    
    // Seed Custom Admin User
    const [adminCheck] = await pool.query('SELECT id FROM users WHERE username = ?', ['Pardha Saradhi']);
    if (adminCheck.length === 0) {
        await pool.query(
            'INSERT INTO users (username, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
            ['Pardha Saradhi', 'thatiparthipardhasaradhi@gmail.com', '9493047018', '123456789', 'Admin']
        );
    }

    const [userCheck] = await pool.query('SELECT id FROM users WHERE username = ?', ['user']);
    if (userCheck.length === 0) {
        await pool.query(
            'INSERT INTO users (username, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
            ['user', 'user@test.com', '9876543210', 'user123', 'User']
        );
    }

    return pool;
};

export const getDb = () => pool;
