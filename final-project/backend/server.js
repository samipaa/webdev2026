import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running successfully" });
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/contact-requests", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, contact_date, message, created_at
       FROM contact_requests
       ORDER BY created_at DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Contact request query failed:", error);
    res.status(500).json({ error: "Contact request query failed" });
  }
});

app.post("/api/contact-requests", async (req, res) => {
  try {
    const { name, email, phone, date, message } = req.body;

    if (!name || !email || !phone || !date || !message) {
      return res.status(400).json({ error: "All form fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO contact_requests (name, email, phone, contact_date, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, contact_date, message, created_at`,
      [name, email, phone, date, message],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Contact request insert failed:", error);
    return res.status(500).json({ error: "Contact request insert failed." });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
