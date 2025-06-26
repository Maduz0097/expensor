const express = require('express');
const router = express.Router();
const { getBudget, getBudgetByCategory, insertBudget, updateBudget, deleteBudget } = require('../utils/db');
const { getCurrentMonth } = require('../utils/dateUtils');

/**
 * GET /budget - Fetch and render budget data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const currentMonth = getCurrentMonth();
        const budgets = await getBudget(currentMonth);
        res.render('budget', { title: 'Budget', budgets, editBudget: null });
    } catch (error) {
        console.error('Budget fetch error:', error);
        res.status(500).send('Server error: Unable to fetch budget');
    }
});

/**
 * GET /budget/edit/:category - Render edit form for budget
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:category', async (req, res) => {
    try {
        const budget = await getBudgetByCategory(req.params.category);
        if (!budget) {
            return res.status(404).send('Budget record not found');
        }
        res.render('budget', { title: 'Edit Budget', budgets: await getBudget(getCurrentMonth()), editBudget: budget });
    } catch (error) {
        console.error('Budget edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch budget record');
    }
});

/**
 * POST /budget - Add new budget entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { category, budgeted_amount } = req.body;
        await insertBudget(category, budgeted_amount);
        res.redirect('/budget');
    } catch (error) {
        console.error('Budget insert error:', error);
        res.status(500).send('Server error: Unable to add budget');
    }
});

/**
 * POST /budget/edit/:category - Update budget entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:category', async (req, res) => {
    try {
        const { budgeted_amount } = req.body;
        await updateBudget(req.params.category, budgeted_amount);
        res.redirect('/budget');
    } catch (error) {
        console.error('Budget update error:', error);
        res.status(500).send('Server error: Unable to update budget');
    }
});

/**
 * POST /budget/delete/:category - Delete budget entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:category', async (req, res) => {
    try {
        await deleteBudget(req.params.category);
        res.redirect('/budget');
    } catch (error) {
        console.error('Budget delete error:', error);
        res.status(500).send('Server error: Unable to delete budget');
    }
});

module.exports = router;