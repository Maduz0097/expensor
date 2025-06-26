const db = require('../models/database');

/**
 * Wraps SQLite query in a Promise
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const queryAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db || typeof db.all !== 'function') {
            reject(new Error('Database not initialized or db.all is not a function'));
            return;
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('queryAll error:', err.message, { sql, params });
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Wraps SQLite single-row query in a Promise
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Single row result
 */
const queryOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db || typeof db.get !== 'function') {
            reject(new Error('Database not initialized or db.get is not a function'));
            return;
        }
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('queryOne error:', err.message, { sql, params });
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Wraps SQLite insert or update in a Promise
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<void>}
 */
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db || typeof db.run !== 'function') {
            reject(new Error('Database not initialized or db.run is not a function'));
            return;
        }
        db.run(sql, params, (err) => {
            if (err) {
                console.error('run error:', err.message, { sql, params });
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Get total income for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<number>} Total income
 */
const getTotalIncome = async (startDate, endDate) => {
    const row = await queryOne(
        `SELECT SUM(amount) as total_income FROM income WHERE date BETWEEN ? AND ?`,
        [startDate, endDate]
    );
    return row ? row.total_income || 0 : 0;
};

/**
 * Get total expenses for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<number>} Total expenses
 */
const getTotalExpenses = async (startDate, endDate) => {
    const row = await queryOne(
        `SELECT SUM(amount) as total_expenses FROM expenses WHERE date BETWEEN ? AND ?`,
        [startDate, endDate]
    );
    return row ? row.total_expenses || 0 : 0;
};

/**
 * Get expense categories for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Expense categories with amounts
 */
const getExpenseCategories = async (startDate, endDate) => {
    const categories = await queryAll(
        `SELECT category, SUM(amount) as amount FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category`,
        [startDate, endDate]
    );
    console.log('Categories data:', categories);
    return categories || [];
};

/**
 * Get latest net worth
 * @returns {Promise<number>} Net worth
 */
const getNetWorth = async () => {
    const row = await queryOne(`SELECT * FROM assets_liabilities ORDER BY date DESC LIMIT 1`);
    if (!row) return 0;
    return (
        row.cash_bank + row.investments + row.property + row.vehicles + row.other_valuables -
        row.credit_card_debt - row.loans - row.mortgage - row.other_debts
    );
};

/**
 * Get income trend for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Monthly income totals
 */
const getIncomeTrend = async (startDate, endDate) => {
    const trend = await queryAll(
        `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total_income
     FROM income 
     WHERE date BETWEEN ? AND ? 
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month`,
        [startDate, endDate]
    );
    console.log('Raw Income trend:', trend);
    return trend;
};

/**
 * Get expense trend for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Monthly expense totals
 */
const getExpenseTrend = async (startDate, endDate) => {
    const trend = await queryAll(
        `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total_expenses
     FROM expenses 
     WHERE date BETWEEN ? AND ? 
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month`,
        [startDate, endDate]
    );
    console.log('Raw Expense trend:', trend);
    return trend;
};

/**
 * Get all income records
 * @returns {Promise<Array>} Income records
 */
const getAllIncome = async () => {
    return await queryAll(`SELECT * FROM income`);
};

/**
 * Get income record by ID
 * @param {number} id - Income record ID
 * @returns {Promise<Object>} Income record
 */
const getIncomeById = async (id) => {
    return await queryOne(`SELECT * FROM income WHERE id = ?`, [id]);
};

/**
 * Insert new income record
 * @param {string} date - Income date
 * @param {string} source - Income source
 * @param {number} amount - Income amount
 * @param {string} type - Income type
 * @param {string} notes - Income notes
 * @returns {Promise<void>}
 */
const insertIncome = async (date, source, amount, type, notes) => {
    await run(
        `INSERT INTO income (date, source, amount, type, notes) VALUES (?, ?, ?, ?, ?)`,
        [date, source, amount, type, notes]
    );
};

/**
 * Update income record
 * @param {number} id - Income record ID
 * @param {string} date - Income date
 * @param {string} source - Income source
 * @param {number} amount - Income amount
 * @param {string} type - Income type
 * @param {string} notes - Income notes
 * @returns {Promise<void>}
 */
const updateIncome = async (id, date, source, amount, type, notes) => {
    await run(
        `UPDATE income SET date = ?, source = ?, amount = ?, type = ?, notes = ? WHERE id = ?`,
        [date, source, amount, type, notes, id]
    );
};

/**
 * Delete income record
 * @param {number} id - Income record ID
 * @returns {Promise<void>}
 */
const deleteIncome = async (id) => {
    await run(`DELETE FROM income WHERE id = ?`, [id]);
};

/**
 * Get all expense records
 * @returns {Promise<Array>} Expense records
 */
const getAllExpenses = async () => {
    return await queryAll(`SELECT * FROM expenses`);
};

/**
 * Get expense record by ID
 * @param {number} id - Expense record ID
 * @returns {Promise<Object>} Expense record
 */
const getExpenseById = async (id) => {
    return await queryOne(`SELECT * FROM expenses WHERE id = ?`, [id]);
};

/**
 * Insert new expense record
 * @param {string} date - Expense date
 * @param {string} description - Expense description
 * @param {string} category - Expense category
 * @param {number} amount - Expense amount
 * @param {string} payment_method - Payment method
 * @param {string} notes - Expense notes
 * @returns {Promise<void>}
 */
const insertExpense = async (date, description, category, amount, payment_method, notes) => {
    await run(
        `INSERT INTO expenses (date, description, category, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [date, description, category, amount, payment_method, notes]
    );
};

/**
 * Update expense record
 * @param {number} id - Expense record ID
 * @param {string} date - Expense date
 * @param {string} description - Expense description
 * @param {string} category - Expense category
 * @param {number} amount - Expense amount
 * @param {string} payment_method - Payment method
 * @param {string} notes - Expense notes
 * @returns {Promise<void>}
 */
const updateExpense = async (id, date, description, category, amount, payment_method, notes) => {
    await run(
        `UPDATE expenses SET date = ?, description = ?, category = ?, amount = ?, payment_method = ?, notes = ? WHERE id = ?`,
        [date, description, category, amount, payment_method, notes, id]
    );
};

/**
 * Delete expense record
 * @param {number} id - Expense record ID
 * @returns {Promise<void>}
 */
const deleteExpense = async (id) => {
    await run(`DELETE FROM expenses WHERE id = ?`, [id]);
};

/**
 * Get all savings records
 * @returns {Promise<Array>} Savings records
 */
const getAllSavings = async () => {
    return await queryAll(`SELECT * FROM savings`);
};

/**
 * Get savings record by ID
 * @param {number} id - Savings record ID
 * @returns {Promise<Object>} Savings record
 */
const getSavingsById = async (id) => {
    return await queryOne(`SELECT * FROM savings WHERE id = ?`, [id]);
};

/**
 * Insert new savings record
 * @param {string} date - Savings date
 * @param {string} account_name - Account name
 * @param {string} type - Savings type
 * @param {number} contribution - Contribution amount
 * @param {number} current_value - Current value
 * @param {string} notes - Savings notes
 * @returns {Promise<void>}
 */
const insertSaving = async (date, account_name, type, contribution, current_value, notes) => {
    await run(
        `INSERT INTO savings (date, account_name, type, contribution, current_value, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [date, account_name, type, contribution, current_value, notes]
    );
};

/**
 * Update savings record
 * @param {number} id - Savings record ID
 * @param {string} date - Savings date
 * @param {string} account_name - Account name
 * @param {string} type - Savings type
 * @param {number} contribution - Contribution amount
 * @param {number} current_value - Current value
 * @param {string} notes - Savings notes
 * @returns {Promise<void>}
 */
const updateSaving = async (id, date, account_name, type, contribution, current_value, notes) => {
    await run(
        `UPDATE savings SET date = ?, account_name = ?, type = ?, contribution = ?, current_value = ?, notes = ? WHERE id = ?`,
        [date, account_name, type, contribution, current_value, notes, id]
    );
};

/**
 * Delete savings record
 * @param {number} id - Savings record ID
 * @returns {Promise<void>}
 */
const deleteSaving = async (id) => {
    await run(`DELETE FROM savings WHERE id = ?`, [id]);
};

/**
 * Get budget data for a month
 * @param {string} currentMonth - Current month (YYYY-MM)
 * @returns {Promise<Array>} Budget data
 */
const getBudget = async (currentMonth) => {
    return await queryAll(
        `SELECT budget.category, budgeted_amount, COALESCE(SUM(expenses.amount), 0) as actual_spent 
     FROM budget 
     LEFT JOIN expenses ON budget.category = expenses.category AND strftime('%Y-%m', expenses.date) = ? 
     GROUP BY budget.category`,
        [currentMonth]
    );
};

/**
 * Get budget record by category
 * @param {string} category - Budget category
 * @returns {Promise<Object>} Budget record
 */
const getBudgetByCategory = async (category) => {
    return await queryOne(`SELECT * FROM budget WHERE category = ?`, [category]);
};

/**
 * Insert new budget record
 * @param {string} category - Budget category
 * @param {number} budgeted_amount - Budgeted amount
 * @returns {Promise<void>}
 */
const insertBudget = async (category, budgeted_amount) => {
    await run(
        `INSERT INTO budget (category, budgeted_amount) VALUES (?, ?)`,
        [category, budgeted_amount]
    );
};

/**
 * Update budget record
 * @param {string} category - Budget category
 * @param {number} budgeted_amount - Budgeted amount
 * @returns {Promise<void>}
 */
const updateBudget = async (category, budgeted_amount) => {
    await run(
        `UPDATE budget SET budgeted_amount = ? WHERE category = ?`,
        [budgeted_amount, category]
    );
};

/**
 * Delete budget record
 * @param {string} category - Budget category
 * @returns {Promise<void>}
 */
const deleteBudget = async (category) => {
    await run(`DELETE FROM budget WHERE category = ?`, [category]);
};

/**
 * Get all assets and liabilities records
 * @returns {Promise<Array>} Assets and liabilities records
 */
const getAllAssetsLiabilities = async () => {
    return await queryAll(`SELECT * FROM assets_liabilities ORDER BY date DESC`);
};

/**
 * Get assets and liabilities record by ID
 * @param {number} id - Record ID
 * @returns {Promise<Object>} Assets and liabilities record
 */
const getAssetsLiabilitiesById = async (id) => {
    return await queryOne(`SELECT * FROM assets_liabilities WHERE id = ?`, [id]);
};

/**
 * Insert new assets and liabilities record
 * @param {string} date - Record date
 * @param {number} cash_bank - Cash and bank balance
 * @param {number} investments - Investments value
 * @param {number} property - Property value
 * @param {number} vehicles - Vehicles value
 * @param {number} other_valuables - Other valuables value
 * @param {number} credit_card_debt - Credit card debt
 * @param {number} loans - Loans amount
 * @param {number} mortgage - Mortgage amount
 * @param {number} other_debts - Other debts amount
 * @returns {Promise<void>}
 */
const insertAssetsLiabilities = async (date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts) => {
    await run(
        `INSERT INTO assets_liabilities (date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts]
    );
};

/**
 * Update assets and liabilities record
 * @param {number} id - Record ID
 * @param {string} date - Record date
 * @param {number} cash_bank - Cash and bank balance
 * @param {number} investments - Investments value
 * @param {number} property - Property value
 * @param {number} vehicles - Vehicles value
 * @param {number} other_valuables - Other valuables value
 * @param {number} credit_card_debt - Credit card debt
 * @param {number} loans - Loans amount
 * @param {number} mortgage - Mortgage amount
 * @param {number} other_debts - Other debts amount
 * @returns {Promise<void>}
 */
const updateAssetsLiabilities = async (id, date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts) => {
    await run(
        `UPDATE assets_liabilities SET date = ?, cash_bank = ?, investments = ?, property = ?, vehicles = ?, other_valuables = ?, 
     credit_card_debt = ?, loans = ?, mortgage = ?, other_debts = ? WHERE id = ?`,
        [date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts, id]
    );
};

/**
 * Delete assets and liabilities record
 * @param {number} id - Record ID
 * @returns {Promise<void>}
 */
const deleteAssetsLiabilities = async (id) => {
    await run(`DELETE FROM assets_liabilities WHERE id = ?`, [id]);
};

module.exports = {
    getTotalIncome,
    getTotalExpenses,
    getExpenseCategories,
    getNetWorth,
    getIncomeTrend,
    getExpenseTrend,
    getAllIncome,
    getIncomeById,
    insertIncome,
    updateIncome,
    deleteIncome,
    getAllExpenses,
    getExpenseById,
    insertExpense,
    updateExpense,
    deleteExpense,
    getAllSavings,
    getSavingsById,
    insertSaving,
    updateSaving,
    deleteSaving,
    getBudget,
    getBudgetByCategory,
    insertBudget,
    updateBudget,
    deleteBudget,
    getAllAssetsLiabilities,
    getAssetsLiabilitiesById,
    insertAssetsLiabilities,
    updateAssetsLiabilities,
    deleteAssetsLiabilities
};