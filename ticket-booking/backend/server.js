import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Set up Real Gmail SMTP Server
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thatiparthipardhasaradhi@gmail.com',
        // Note: If this is your normal password, Google will block it. You MUST use an App Password.
        pass: 'tepm sycm kuqc zhwc'
    }
});
console.log("Live Gmail service ready!");

io.on('connection', (socket) => {
    console.log('Client connected for real-time updates');
});

initDb().then(() => {
    console.log('MySQL Database Connected & Checked');
}).catch(e => {
    console.error('Failed to initialize MySQL database', e);
});

// AUTHENTICATION API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, mobile, password } = req.body;
        const db = getDb();
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

        const [result] = await db.query(
            'INSERT INTO users (username, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, mobile, password, 'User']
        );
        res.status(201).json({ id: result.insertId, username, role: 'User' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await getDb().query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            const user = rows[0];
            res.json({ id: user.id, username: user.username, role: user.role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PAYMENT API SIMULATION
app.post('/api/payment/otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) return res.status(400).json({ error: "Invalid phone number" });
    res.json({ success: true, message: "OTP sent successfully" });
});

app.post('/api/payment/verify', (req, res) => {
    const { otp } = req.body;
    if (otp === '1234') {
        res.json({ success: true, transactionId: `TXN${Date.now()}` });
    } else {
        res.status(400).json({ error: "Invalid OTP. Use 1234 for testing." });
    }
});

// EVENTS API
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await getDb().query('SELECT * FROM events');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/events', async (req, res) => {
    try {
        const { name, department, date, venue, price, availableTickets } = req.body;
        const [result] = await getDb().query(
            'INSERT INTO events (name, department, date, venue, price, availableTickets) VALUES (?, ?, ?, ?, ?, ?)',
            [name, department, date, venue, price, availableTickets]
        );
        io.emit('event-updated');
        res.status(201).json({ id: result.insertId, name, department });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, date, venue, price, availableTickets } = req.body;
        await getDb().query(
            'UPDATE events SET name = ?, department = ?, date = ?, venue = ?, price = ?, availableTickets = ? WHERE id = ?',
            [name, department, date, venue, price, availableTickets, id]
        );
        io.emit('event-updated');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await getDb().query('DELETE FROM events WHERE id = ?', [req.params.id]);
        io.emit('event-updated');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// BOOKINGS API
app.get('/api/bookings', async (req, res) => {
    try {
        const [bookings] = await getDb().query(`
            SELECT b.*, e.name as eventName
            FROM bookings b JOIN events e ON b.eventId = e.id ORDER BY b.id DESC
        `);
        res.json(bookings);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const { eventId, userName, email, department, ticketsBooked, totalAmount, paymentStatus } = req.body;
        const db = getDb();
        const [rows] = await db.query('SELECT name, availableTickets FROM events WHERE id = ?', [eventId]);

        if (rows.length === 0 || rows[0].availableTickets < ticketsBooked) {
            return res.status(400).json({ error: 'Not enough available tickets' });
        }

        const eventName = rows[0].name;

        await db.query(
            'INSERT INTO bookings (eventId, userName, email, department, ticketsBooked, totalAmount, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [eventId, userName, email, department, ticketsBooked, totalAmount, paymentStatus || 'Completed']
        );
        await db.query('UPDATE events SET availableTickets = availableTickets - ? WHERE id = ?', [ticketsBooked, eventId]);

        io.emit('event-updated');

        if (transporter && email) {
            const qrData = encodeURIComponent(`Event:${eventName}|Name:${userName}|Tickets:${ticketsBooked}|Amt:${totalAmount}`);
            const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: white; padding: 25px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Payment Receipt</h2>
                    <p style="margin: 8px 0 0; opacity: 0.9;">Transaction Authorized Successfully</p>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #334155;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 15px; color: #475569; line-height: 1.5;">Thank you for your purchase! Your payment has been successfully processed. Below are your official booking details.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 25px; margin-bottom: 25px; font-size: 15px;">
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748B;">Event Target</td>
                            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${eventName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748B;">Department</td>
                            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${department}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748B;">Ticket Quantity</td>
                            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${ticketsBooked}</td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 0; color: #0f172a; font-size: 18px; font-weight: 600;">Total Amount</td>
                            <td style="padding: 15px 0; text-align: right; font-weight: 800; font-size: 18px; color: #10B981;">Rs. ${totalAmount}</td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin-top: 35px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                        <p style="color: #475569; font-size: 14px; font-weight: 600; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Official Entry QR Code</p>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${qrData}" alt="Entry QR Code" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0; margin-top: 15px;">Please present this QR code at the venue entrance.</p>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; color: #94a3b8; text-align: center; padding: 15px; font-size: 12px;">
                    &copy; Campus Events Secure Ticketing System
                </div>
            </div>`;

            transporter.sendMail({
                from: '"Campus Events" <event@gmail.com>',
                to: email,
                subject: `Ticket Receipt: ${eventName}`,
                html: emailHtml
            }).then(() => {
                console.log("✉️ RECEIPT SENT TO LOCAL MAILDEV INBOX!");
            }).catch(e => console.error("Email error:", e));
        }

        res.status(201).json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// USERS MAPPER API
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await getDb().query('SELECT id, username, email, mobile, role FROM users ORDER BY id DESC');
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        await getDb().query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await getDb().query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = 5000;
httpServer.listen(PORT, () => { console.log(`Backend API serving on http://localhost:${PORT}`); });
