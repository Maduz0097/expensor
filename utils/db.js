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
 * @returns {Promise<Object>} Last inserted ID
 */
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db || typeof db.run !== 'function') {
            reject(new Error('Database not initialized or db.run is not a function'));
            return;
        }
        db.run(sql, params, function (err) {
            if (err) {
                console.error('run error:', err.message, { sql, params });
                reject(err);
            } else {
                resolve({ lastID: this.lastID });
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
    const loansLeases = await queryAll(`SELECT SUM(remaining_balance) as total_loans_leases FROM loans_leases`);
    if (!row) return 0;
    const totalLoansLeases = loansLeases[0]?.total_loans_leases || 0;
    return (
        row.cash_bank +
        row.investments +
        row.property +
        row.vehicles +
        row.other_valuables -
        row.credit_card_debt -
        row.mortgage -
        row.other_debts -
        totalLoansLeases
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
    return await queryAll(`
    SELECT e.*, ll.name as loan_lease_name 
    FROM expenses e 
    LEFT JOIN loans_leases ll ON e.loan_lease_id = ll.id
  `);
};

/**
 * Get expense record by ID
 * @param {number} id - Expense record ID
 * @returns {Promise<Object>} Expense record
 */
const getExpenseById = async (id) => {
    return await queryOne(`
    SELECT e.*, ll.name as loan_lease_name 
    FROM expenses e 
    LEFT JOIN loans_leases ll ON e.loan_lease_id = ll.id 
    WHERE e.id = ?
  `, [id]);
};

/**
 * Insert new expense record
 * @param {string} date - Expense date
 * @param {string} description - Expense description
 * @param {string} category - Expense category
 * @param {number} amount - Expense amount
 * @param {string} payment_method - Payment method
 * @param {string} notes - Expense notes
 * @param {number|null} loan_lease_id - Loan/Lease ID
 * @returns {Promise<void>}
 */
const insertExpense = async (date, description, category, amount, payment_method, notes, loan_lease_id = null) => {
    await run(
        `INSERT INTO expenses (date, description, category, amount, payment_method, notes, loan_lease_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date, description, category, amount, payment_method, notes, loan_lease_id]
    );
    if (loan_lease_id && (category === 'Loan' || category === 'Lease')) {
        await run(
            `UPDATE loans_leases SET remaining_balance = remaining_balance - ? WHERE id = ?`,
            [amount, loan_lease_id]
        );
    }
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
 * @param {number|null} loan_lease_id - Loan/Lease ID
 * @returns {Promise<void>}
 */
const updateExpense = async (id, date, description, category, amount, payment_method, notes, loan_lease_id = null) => {
    const oldExpense = await getExpenseById(id);
    if (oldExpense.loan_lease_id && (oldExpense.category === 'Loan' || oldExpense.category === 'Lease')) {
        await run(
            `UPDATE loans_leases SET remaining_balance = remaining_balance + ? WHERE id = ?`,
            [oldExpense.amount, oldExpense.loan_lease_id]
        );
    }
    await run(
        `UPDATE expenses SET date = ?, description = ?, category = ?, amount = ?, payment_method = ?, notes = ?, loan_lease_id = ? 
     WHERE id = ?`,
        [date, description, category, amount, payment_method, notes, loan_lease_id, id]
    );
    if (loan_lease_id && (category === 'Loan' || category === 'Lease')) {
        await run(
            `UPDATE loans_leases SET remaining_balance = remaining_balance - ? WHERE id = ?`,
            [amount, loan_lease_id]
        );
    }
};

/**
 * Delete expense record
 * @param {number} id - Expense record ID
 * @returns {Promise<void>}
 */
const deleteExpense = async (id) => {
    const expense = await getExpenseById(id);
    if (expense.loan_lease_id && (expense.category === 'Loan' || expense.category === 'Lease')) {
        await run(
            `UPDATE loans_leases SET remaining_balance = remaining_balance + ? WHERE id = ?`,
            [expense.amount, expense.loan_lease_id]
        );
    }
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

/**
 * Get all loans and leases
 * @returns {Promise<Array>} Loan and lease records
 */
const getAllLoansLeases = async () => {
    return await queryAll(`SELECT * FROM loans_leases`);
};

/**
 * Get loan/lease by ID
 * @param {number} id - Loan/Lease ID
 * @returns {Promise<Object>} Loan/Lease record
 */
const getLoanLeaseById = async (id) => {
    return await queryOne(`SELECT * FROM loans_leases WHERE id = ?`, [id]);
};

/**
 * Insert new loan/lease
 * @param {string} name - Loan/Lease name
 * @param {string} type - Loan or Lease
 * @param {number} total_amount - Total amount
 * @param {number} monthly_installment - Monthly installment
 * @param {number} remaining_balance - Remaining balance
 * @param {string} start_date - Start date
 * @param {string} end_date - End date
 * @param {string} notes - Notes
 * @returns {Promise<number>} Inserted ID
 */
const insertLoanLease = async (name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes) => {
    const result = await run(
        `INSERT INTO loans_leases (name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes]
    );
    return result.lastID;
};

/**
 * Update loan/lease
 * @param {number} id - Loan/Lease ID
 * @param {string} name - Loan/Lease name
 * @param {string} type - Loan or Lease
 * @param {number} total_amount - Total amount
 * @param {number} monthly_installment - Monthly installment
 * @param {number} remaining_balance - Remaining balance
 * @param {string} start_date - Start date
 * @param {string} end_date - End date
 * @param {string} notes - Notes
 * @returns {Promise<void>}
 */
const updateLoanLease = async (id, name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes) => {
    await run(
        `UPDATE loans_leases SET name = ?, type = ?, total_amount = ?, monthly_installment = ?, remaining_balance = ?, start_date = ?, end_date = ?, notes = ? 
     WHERE id = ?`,
        [name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes, id]
    );
};

/**
 * Delete loan/lease
 * @param {number} id - Loan/Lease ID
 * @returns {Promise<void>}
 */
const deleteLoanLease = async (id) => {
    await run(`DELETE FROM expenses WHERE loan_lease_id = ?`, [id]);
    await run(`DELETE FROM loans_leases WHERE id = ?`, [id]);
};

/**
 * Get loan/lease progress for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Loan/lease progress data
 */
const getLoanLeaseProgress = async (startDate, endDate) => {
    try {
        const loansLeases = await queryAll(`
            SELECT ll.id, ll.name, ll.type, ll.total_amount, ll.monthly_installment, ll.remaining_balance,
                   COALESCE(SUM(e.amount), 0) as paid_amount
            FROM loans_leases ll
            LEFT JOIN expenses e ON ll.id = e.loan_lease_id AND e.date BETWEEN ? AND ?
            GROUP BY ll.id
        `, [startDate, endDate]);
        const result = loansLeases.map(ll => {
            const totalAmount = parseFloat(ll.total_amount) || 0;
            const remainingBalance = parseFloat(ll.remaining_balance) || 0;
            const progress = totalAmount > 0 ? ((totalAmount - remainingBalance) / totalAmount * 100) : 0;
            return {
                ...ll,
                total_amount: totalAmount,
                remaining_balance: remainingBalance,
                progress: parseFloat(progress.toFixed(2)) // Ensure progress is a number
            };
        });
        console.log('Loan/Lease Progress:', result);
        return result;
    } catch (err) {
        console.error('Error in getLoanLeaseProgress:', err);
        throw err;
    }
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
    deleteAssetsLiabilities,
    getAllLoansLeases,
    getLoanLeaseById,
    insertLoanLease,
    updateLoanLease,
    deleteLoanLease,
    getLoanLeaseProgress,queryAll, queryOne
};