const express = require('express');
const router = express.Router();
const { getAllExpenses, getExpenseById, insertExpense, updateExpense, deleteExpense, getAllLoansLeases } = require('../utils/db');

/**
 * GET /expenses - Fetch and render expense log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const expenses = await getAllExpenses();
        const loansLeases = await getAllLoansLeases();
        res.render('expenses', { title: 'Expense Log', expenses, editExpense: null, loansLeases });
    } catch (error) {
        console.error('Expenses fetch error:', error);
        res.status(500).send('Server error: Unable to fetch expenses');
    }
});

/**
 * GET /expenses/edit/:id - Render edit form for expense
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:id', async (req, res) => {
    try {
        const expense = await getExpenseById(req.params.id);
        if (!expense) {
            return res.status(404).send('Expense record not found');
        }
        const loansLeases = await getAllLoansLeases();
        res.render('expenses', { title: 'Edit Expense', expenses: await getAllExpenses(), editExpense: expense, loansLeases });
    } catch (error) {
        console.error('Expense edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch expense record');
    }
});

/**
 * POST /expenses - Add new expense entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { date, description, category, amount, payment_method, notes, loan_lease_id } = req.body;
        await insertExpense(date, description, category, parseFloat(amount), payment_method, notes, loan_lease_id ? parseInt(loan_lease_id) : null);
        res.redirect('/expenses');
    } catch (error) {
        console.error('Expenses insert error:', error);
        res.status(500).send('Server error: Unable to add expense');
    }
});

/**
 * POST /expenses/edit/:id - Update expense entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:id', async (req, res) => {
    try {
        const { date, description, category, amount, payment_method, notes, loan_lease_id } = req.body;
        await updateExpense(
            req.params.id,
            date,
            description,
            category,
            parseFloat(amount),
            payment_method,
            notes,
            loan_lease_id ? parseInt(loan_lease_id) : null
        );
        res.redirect('/expenses');
    } catch (error) {
        console.error('Expense update error:', error);
        res.status(500).send('Server error: Unable to update expense');
    }
});

/**
 * POST /expenses/delete/:id - Delete expense entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteExpense(req.params.id);
        res.redirect('/expenses');
    } catch (error) {
        console.error('Expense delete error:', error);
        res.status(500).send('Server error: Unable to delete expense');
    }
});

module.exports = router;