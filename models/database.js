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

// Migration function to update schema
const migrateDatabase = () => {
    db.serialize(() => {
        // Create tables if they don't exist
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
        db.run(`
      CREATE TABLE IF NOT EXISTS loans_leases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        total_amount REAL NOT NULL,
        monthly_installment REAL NOT NULL,
        remaining_balance REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
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
        notes TEXT,
        loan_lease_id INTEGER,
        FOREIGN KEY (loan_lease_id) REFERENCES loans_leases(id)
      )
    `);

        // Check if expenses table exists
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`, (err, table) => {
            if (err) {
                console.error('Error checking for expenses table:', err.message);
                return;
            }
            if (!table) {
                console.log('Expenses table does not exist; it was created above');
                return;
            }
            // Check for loan_lease_id column
            db.all(`PRAGMA table_info(expenses)`, (err, columns) => {
                if (err) {
                    console.error('Error executing PRAGMA table_info(expenses):', err.message);
                    return;
                }
                if (!columns || !Array.isArray(columns)) {
                    console.error('PRAGMA table_info(expenses) returned invalid data:', columns);
                    return;
                }
                const hasLoanLeaseId = columns.some(col => col.name === 'loan_lease_id');
                if (!hasLoanLeaseId) {
                    console.log('Adding loan_lease_id column to expenses table...');
                    // Create a new expenses table with the updated schema
                    db.run(`
            CREATE TABLE expenses_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              description TEXT NOT NULL,
              category TEXT NOT NULL,
              amount REAL NOT NULL,
              payment_method TEXT,
              notes TEXT,
              loan_lease_id INTEGER,
              FOREIGN KEY (loan_lease_id) REFERENCES loans_leases(id)
            )
          `, (err) => {
                        if (err) {
                            console.error('Error creating expenses_new table:', err.message);
                            return;
                        }
                        // Migrate data from old expenses table
                        db.run(`
              INSERT INTO expenses_new (id, date, description, category, amount, payment_method, notes)
              SELECT id, date, description, category, amount, payment_method, notes
              FROM expenses
            `, (err) => {
                            if (err) {
                                console.error('Error migrating expenses data:', err.message);
                                return;
                            }
                            // Drop old expenses table and rename new one
                            db.run(`DROP TABLE expenses`, (err) => {
                                if (err) {
                                    console.error('Error dropping old expenses table:', err.message);
                                    return;
                                }
                                db.run(`ALTER TABLE expenses_new RENAME TO expenses`, (err) => {
                                    if (err) {
                                        console.error('Error renaming expenses table:', err.message);
                                    } else {
                                        console.log('Expenses table updated with loan_lease_id column');
                                    }
                                });
                            });
                        });
                    });
                } else {
                    console.log('Expenses table already has loan_lease_id column');
                }
            });
        });
    });
};

// Run migration
migrateDatabase();

module.exports = db;