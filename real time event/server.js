const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "DELETE", "PUT"] }
});

const JWT_SECRET = "trackwise_super_secret_2024";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token." });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admin can perform this action" });
  }
  next();
}

function logout() {
  localStorage.removeItem("token"); // ✅ remove JWT
  alert("Logged out successfully");
  window.location.href = "/login.html"; // or your login page
}

// ─── AUTH ROUTES ───────────────────────────────────────────────────────────────
app.post("/auth/register", (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password || !full_name)
    return res.status(400).json({ error: "All fields required." });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email format." });

  db.query(
    "SELECT id, username FROM users WHERE email = ? OR username = ?",
    [email, username],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        if (results.some(r => r.username === username)) {
          return res.status(409).json({ error: "use other username" });
        }
        return res.status(409).json({ error: "User already exists with this email." });
      }

      const hashed = bcrypt.hashSync(password, 10);

      const role = "user"; // ✅ NEW FIELD

      db.query(
        "INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)", // ✅ UPDATED QUERY
        [username, email, hashed, full_name, role],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          const token = jwt.sign(
            {
              id: result.insertId,
              username,
              email,
              full_name,
              role, // ✅ ADD ROLE TO TOKEN
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({
            token,
            user: {
              id: result.insertId,
              username,
              email,
              full_name,
              role, // ✅ INCLUDE ROLE IN RESPONSE
            },
          });
        }
      );
    }
  );
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials." });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: "Invalid credentials." });

    // Update last login
    db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role }, // ✅ INCLUDE ROLE IN TOKEN
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role } }); // ✅ INCLUDE ROLE IN RESPONSE
  });
});

// ─── EVENTS ROUTES (protected) ─────────────────────────────────────────────────
app.get("/events", authenticateToken, (req, res) => {
  let query = `
    SELECT e.*, u.full_name as creator_name, u.username 
    FROM events e 
    JOIN users u ON e.user_id = u.id
  `;

  let params = [];

  query += " ORDER BY e.created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.post("/events", authenticateToken, authorizeAdmin, (req, res) => {
  const { title, description, priority, category } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });

  const sql = "INSERT INTO events (title, description, priority, category, user_id, status) VALUES (?, ?, ?, ?, ?, 'active')";
  db.query(sql, [title, description || "", priority || "medium", category || "general", req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const newEvent = {
      id: result.insertId,
      title,
      description: description || "",
      priority: priority || "medium",
      category: category || "general",
      user_id: req.user.id,
      creator_name: req.user.full_name,
      username: req.user.username,
      status: "active",
      created_at: new Date()
    };

    io.emit("new_event", newEvent);
    res.json(newEvent);
  });
});

app.put("/events/:id", authenticateToken, (req, res) => {
  const { title, description, priority, category, status } = req.body;
  const { id } = req.params;

  db.query("SELECT user_id FROM events WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Event not found." });
    if (results[0].user_id !== req.user.id)
      return res.status(403).json({ error: "You can only edit your own events." });

    db.query(
      "UPDATE events SET title=?, description=?, priority=?, category=?, status=?, updated_at=NOW() WHERE id=?",
      [title, description, priority, category, status, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        const updated = { id: parseInt(id), title, description, priority, category, status, user_id: req.user.id };
        io.emit("update_event", updated);
        res.json(updated);
      }
    );
  });
});

app.delete("/events/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("SELECT user_id FROM events WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Event not found." });
    if (results[0].user_id !== req.user.id)
      return res.status(403).json({ error: "You can only delete your own events." });

    db.query("DELETE FROM events WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      io.emit("delete_event", { id: parseInt(id) });
      res.json({ success: true });
    });
  });
});

app.get("/stats", authenticateToken, (req, res) => {
  db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN priority='high' THEN 1 ELSE 0 END) as high_priority
     FROM events WHERE user_id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    }
  );
});

// ─── SOCKET.IO ─────────────────────────────────────────────────────────────────
const onlineUsers = new Map();
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("No token"));

  try {
    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.user;

  onlineUsers[user.id] = user;

  io.emit("online_users", Object.values(onlineUsers));

  socket.on("disconnect", () => {
    delete onlineUsers[user.id];
    io.emit("online_users", Object.values(onlineUsers));
  });
});

server.listen(5000, () => {
  console.log("🚀 TrackWise server running on http://localhost:5000");
});
