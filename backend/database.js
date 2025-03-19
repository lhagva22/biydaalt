// database.js
import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES модульд __dirname-ийн эквивалентыг авах
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQLite санг холбох
const db = new sqlite3.Database(join(__dirname, 'users.db'), (err) => {
  if (err) {
    console.error('SQLite үүсгэх алдаа:', err.message);
  } else {
    console.log('SQLite холбож байна...');
  }
});

// Хэрэглэгчийн хүснэгт үүсгэх

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  encryptionKey TEXT, 
  name TEXT,
  surname TEXT,
  address TEXT,
  phone TEXT,
  registerNumber TEXT
);`);

export default db;
