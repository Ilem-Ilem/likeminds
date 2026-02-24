import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("bookclub.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active', -- 'active' or 'inactive'
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover TEXT,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'available',
    is_featured INTEGER DEFAULT 0,
    event_id INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location TEXT,
    type TEXT, -- 'online' or 'physical'
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'closed', 'completed'
    whatsapp_number TEXT, -- Primary contact
    form_fields TEXT, -- JSON string for dynamic registration fields
    registration_start_date DATETIME,
    registration_end_date DATETIME
  );

  // Ensure columns exist for existing databases
  try { db.prepare("ALTER TABLE events ADD COLUMN registration_start_date DATETIME").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE events ADD COLUMN registration_end_date DATETIME").run(); } catch(e) {}

  CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    phone_number TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    price REAL,
    quantity INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_id INTEGER,
    ticket_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    form_responses TEXT, -- JSON string for dynamic field answers
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Seed default settings
  INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'Lumina Book Club');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('site_logo', '');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_provider', 'stripe');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_public_key', '');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_secret_key', '');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('contact_email', 'contact@lumina.com');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_group_link', '');
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)").run(
    "Admin User",
    "admin@bookclub.com",
    "admin",
    "password123"
  );
}

const bookCount = db.prepare("SELECT count(*) as count FROM books").get() as { count: number };
if (bookCount.count === 0) {
  db.prepare("INSERT INTO books (title, author, category, is_featured, description, cover) VALUES (?, ?, ?, ?, ?, ?)").run(
    "The Great Gatsby",
    "F. Scott Fitzgerald",
    "Classic",
    1,
    "A story of wealth, love, and the American Dream.",
    "https://picsum.photos/seed/gatsby/400/600"
  );
  db.prepare("INSERT INTO books (title, author, category, is_featured, description, cover) VALUES (?, ?, ?, ?, ?, ?)").run(
    "Atomic Habits",
    "James Clear",
    "Self-Help",
    1,
    "An easy and proven way to build good habits and break bad ones.",
    "https://picsum.photos/seed/habits/400/600"
  );
}

const eventCount = db.prepare("SELECT count(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  db.prepare("INSERT INTO events (title, description, event_date, location, type, whatsapp_number) VALUES (?, ?, ?, ?, ?, ?)").run(
    "Monthly Book Review: The Great Gatsby",
    "Join us for an evening of deep discussion about Fitzgerald's masterpiece.",
    "2026-03-15 18:00:00",
    "Lagos Library / Online",
    "physical",
    "2348000000000"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/admin/stats", (req, res) => {
    try {
      const totalUsers = db.prepare("SELECT count(*) as count FROM users").get() as any;
      const totalEvents = db.prepare("SELECT count(*) as count FROM events").get() as any;
      const upcomingEvents = db.prepare("SELECT count(*) as count FROM events WHERE status = 'upcoming'").get() as any;
      const totalRegistrations = db.prepare("SELECT count(*) as count FROM registrations").get() as any;
      res.json({
        totalUsers: totalUsers.count,
        totalEvents: totalEvents.count,
        upcomingEvents: upcomingEvents.count,
        totalRegistrations: totalRegistrations.count
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Management
  app.get("/api/admin/users", (req, res) => {
    res.json(db.prepare("SELECT * FROM users ORDER BY created_at DESC").all());
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, password, phone, role, status } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)").run(name, email, password, phone, role || 'member', status || 'active');
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const { name, email, phone, role, status } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?").run(name, email, phone, role, status, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Book Management
  app.get("/api/admin/books", (req, res) => {
    res.json(db.prepare("SELECT * FROM books").all());
  });

  app.post("/api/admin/books", (req, res) => {
    const { title, author, cover, description, category, status, is_featured, event_id } = req.body;
    try {
      const info = db.prepare("INSERT INTO books (title, author, cover, description, category, status, is_featured, event_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(title, author, cover, description, category, status || 'available', is_featured ? 1 : 0, event_id);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/books/:id", (req, res) => {
    const { title, author, cover, description, category, status, is_featured, event_id } = req.body;
    try {
      db.prepare("UPDATE books SET title = ?, author = ?, cover = ?, description = ?, category = ?, status = ?, is_featured = ?, event_id = ? WHERE id = ?").run(title, author, cover, description, category, status, is_featured ? 1 : 0, event_id, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/books/:id", (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Event Management
  app.get("/api/admin/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events").all() as any[];
    const enrichedEvents = events.map(event => {
      const tickets = db.prepare("SELECT * FROM tickets WHERE event_id = ?").all();
      const registrations = db.prepare("SELECT r.*, u.name as user_name, u.email as user_email FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.event_id = ?").all();
      const whatsappContacts = db.prepare("SELECT * FROM whatsapp_contacts WHERE event_id = ?").all();
      return { ...event, tickets, registrations, whatsappContacts };
    });
    res.json(enrichedEvents);
  });

  app.post("/api/admin/events", (req, res) => {
    const { title, description, event_date, location, type, status, whatsapp_number, form_fields, tickets, whatsapp_contacts, registration_start_date, registration_end_date } = req.body;
    try {
      const formFieldsJson = form_fields ? JSON.stringify(form_fields) : null;
      const info = db.prepare("INSERT INTO events (title, description, event_date, location, type, status, whatsapp_number, form_fields, registration_start_date, registration_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(title, description, event_date, location, type, status || 'upcoming', whatsapp_number, formFieldsJson, registration_start_date, registration_end_date);
      const eventId = info.lastInsertRowid;

      if (tickets && Array.isArray(tickets)) {
        const stmt = db.prepare("INSERT INTO tickets (event_id, name, price, quantity) VALUES (?, ?, ?, ?)");
        tickets.forEach((t: any) => stmt.run(eventId, t.name, t.price, t.quantity));
      }

      if (whatsapp_contacts && Array.isArray(whatsapp_contacts)) {
        const stmt = db.prepare("INSERT INTO whatsapp_contacts (event_id, phone_number) VALUES (?, ?)");
        whatsapp_contacts.forEach((p: string) => stmt.run(eventId, p));
      }

      res.json({ success: true, id: eventId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/events/:id", (req, res) => {
    const { title, description, event_date, location, type, status, whatsapp_number, form_fields, tickets, registration_start_date, registration_end_date } = req.body;
    const eventId = req.params.id;
    try {
      const formFieldsJson = form_fields ? JSON.stringify(form_fields) : null;
      db.prepare("UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, type = ?, status = ?, whatsapp_number = ?, form_fields = ?, registration_start_date = ?, registration_end_date = ? WHERE id = ?").run(title, description, event_date, location, type, status, whatsapp_number, formFieldsJson, registration_start_date, registration_end_date, eventId);
      
      if (tickets && Array.isArray(tickets)) {
        db.prepare("DELETE FROM tickets WHERE event_id = ?").run(eventId);
        const stmt = db.prepare("INSERT INTO tickets (event_id, name, price, quantity) VALUES (?, ?, ?, ?)");
        tickets.forEach((t: any) => stmt.run(eventId, t.name, t.price, t.quantity));
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/events/:id", (req, res) => {
    db.prepare("DELETE FROM registrations WHERE event_id = ?").run(req.params.id);
    db.prepare("DELETE FROM tickets WHERE event_id = ?").run(req.params.id);
    db.prepare("DELETE FROM whatsapp_contacts WHERE event_id = ?").run(req.params.id);
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/registrations/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM registrations WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as any[];
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/admin/settings", (req, res) => {
    const updates = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    try {
      Object.entries(updates).forEach(([key, value]) => {
        stmt.run(key, String(value));
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/books", (req, res) => {
    const books = db.prepare("SELECT * FROM books").all();
    res.json(books);
  });

  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY event_date ASC").all();
    res.json(events);
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare("SELECT id, name, email, phone, role, created_at FROM users").all();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?").get(email, password) as any;
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, error: "Invalid email or password" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/register", (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)").run(name, email, password, phone);
      const user = { id: info.lastInsertRowid, name, email, role: 'member' };
      res.json({ success: true, user });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ success: false, error: "Email already exists" });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  app.post("/api/register-event", (req, res) => {
    const { userId, eventId, ticketId, formResponses } = req.body;
    try {
      const formResponsesJson = formResponses ? JSON.stringify(formResponses) : null;
      const info = db.prepare("INSERT INTO registrations (user_id, event_id, ticket_id, form_responses) VALUES (?, ?, ?, ?)").run(userId, eventId, ticketId, formResponsesJson);
      const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as any;
      
      const whatsappMsg = encodeURIComponent(`Hello! I just registered for the event: ${event.title}`);
      const whatsappUrl = `https://wa.me/${event.whatsapp_number}?text=${whatsappMsg}`;
      
      res.json({ success: true, registrationId: info.lastInsertRowid, whatsappUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
