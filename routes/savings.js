const express = require('express');
const router = express.Router();
const { getAllSavings, getSavingsById, insertSaving, updateSaving, deleteSaving } = require('../utils/db');

/**
 * GET /savings - Fetch and render savings log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const savings = await getAllSavings();
        res.render('savings', { title: 'Savings & Investments', savings, editSaving: null });
    } catch (error) {
        console.error('Savings fetch error:', error);
        res.status(500).send('Server error: Unable to fetch savings');
    }
});

/**
 * GET /savings/edit/:id - Render edit form for savings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:id', async (req, res) => {
    try {
        const saving = await getSavingsById(req.params.id);
        if (!saving) {
            return res.status(404).send('Savings record not found');
        }
        res.render('savings', { title: 'Edit Savings', savings: await getAllSavings(), editSaving: saving });
    } catch (error) {
        console.error('Savings edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch savings record');
    }
});

/**
 * POST /savings - Add new savings entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { date, account_name, type, contribution, current_value, notes } = req.body;
        await insertSaving(date, account_name, type, contribution, current_value, notes);
        res.redirect('/savings');
    } catch (error) {
        console.error('Savings insert error:', error);
        res.status(500).send('Server error: Unable to add savings');
    }
});

/**
 * POST /savings/edit/:id - Update savings entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:id', async (req, res) => {
    try {
        const { date, account_name, type, contribution, current_value, notes } = req.body;
        await updateSaving(req.params.id, date, account_name, type, contribution, current_value, notes);
        res.redirect('/savings');
    } catch (error) {
        console.error('Savings update error:', error);
        res.status(500).send('Server error: Unable to update savings');
    }
});

/**
 * POST /savings/delete/:id - Delete savings entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteSaving(req.params.id);
        res.redirect('/savings');
    } catch (error) {
        console.error('Savings delete error:', error);
        res.status(500).send('Server error: Unable to delete savings');
    }
});

module.exports = router;