const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = path.resolve(__dirname, '../finance.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database:', dbPath);
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      source TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT,
      notes TEXT
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT,
      notes TEXT
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      account_name TEXT NOT NULL,
      type TEXT NOT NULL,
      contribution REAL NOT NULL,
      current_value REAL NOT NULL,
      notes TEXT
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS budget (
      category TEXT PRIMARY KEY,
      budgeted_amount REAL NOT NULL
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS assets_liabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      cash_bank REAL NOT NULL,
      investments REAL NOT NULL,
      property REAL NOT NULL,
      vehicles REAL NOT NULL,
      other_valuables REAL NOT NULL,
      credit_card_debt REAL NOT NULL,
      loans REAL NOT NULL,
      mortgage REAL NOT NULL,
      other_debts REAL NOT NULL
    )
  `);
});

module.exports = db;