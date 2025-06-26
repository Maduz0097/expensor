const express = require('express');
const router = express.Router();
const { getAllIncome, getIncomeById, insertIncome, updateIncome, deleteIncome } = require('../utils/db');

/**
 * GET /income - Fetch and render income log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const income = await getAllIncome();
        res.render('income', { title: 'Income Log', income, editIncome: null });
    } catch (error) {
        console.error('Income fetch error:', error);
        res.status(500).send('Server error: Unable to fetch income');
    }
});

/**
 * GET /income/edit/:id - Render edit form for income
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:id', async (req, res) => {
    try {
        const income = await getIncomeById(req.params.id);
        if (!income) {
            return res.status(404).send('Income record not found');
        }
        res.render('income', { title: 'Edit Income', income: await getAllIncome(), editIncome: income });
    } catch (error) {
        console.error('Income edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch income record');
    }
});

/**
 * POST /income - Add new income entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { date, source, amount, type, notes } = req.body;
        await insertIncome(date, source, amount, type, notes);
        res.redirect('/income');
    } catch (error) {
        console.error('Income insert error:', error);
        res.status(500).send('Server error: Unable to add income');
    }
});

/**
 * POST /income/edit/:id - Update income entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:id', async (req, res) => {
    try {
        const { date, source, amount, type, notes } = req.body;
        await updateIncome(req.params.id, date, source, amount, type, notes);
        res.redirect('/income');
    } catch (error) {
        console.error('Income update error:', error);
        res.status(500).send('Server error: Unable to update income');
    }
});

/**
 * POST /income/delete/:id - Delete income entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteIncome(req.params.id);
        res.redirect('/income');
    } catch (error) {
        console.error('Income delete error:', error);
        res.status(500).send('Server error: Unable to delete income');
    }
});

module.exports = router;