const express = require('express');
const router = express.Router();
const { getAllAssetsLiabilities, getAssetsLiabilitiesById, insertAssetsLiabilities, updateAssetsLiabilities, deleteAssetsLiabilities } = require('../utils/db');

/**
 * GET /assets-liabilities - Fetch and render assets & liabilities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const assetsLiabilities = await getAllAssetsLiabilities();
        res.render('assets_liabilities', { title: 'Assets & Liabilities', assetsLiabilities, editAssetsLiability: null });
    } catch (error) {
        console.error('Assets & Liabilities fetch error:', error);
        res.status(500).send('Server error: Unable to fetch assets & liabilities');
    }
});

/**
 * GET /assets-liabilities/edit/:id - Render edit form for assets & liabilities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:id', async (req, res) => {
    try {
        const assetsLiability = await getAssetsLiabilitiesById(req.params.id);
        if (!assetsLiability) {
            return res.status(404).send('Assets & Liabilities record not found');
        }
        res.render('assets_liabilities', { title: 'Edit Assets & Liabilities', assetsLiabilities: await getAllAssetsLiabilities(), editAssetsLiability: assetsLiability });
    } catch (error) {
        console.error('Assets & Liabilities edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch assets & liabilities record');
    }
});

/**
 * POST /assets-liabilities - Add new assets & liabilities entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts } = req.body;
        await insertAssetsLiabilities(date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts);
        res.redirect('/assets-liabilities');
    } catch (error) {
        console.error('Assets & Liabilities insert error:', error);
        res.status(500).send('Server error: Unable to add assets & liabilities');
    }
});

/**
 * POST /assets-liabilities/edit/:id - Update assets & liabilities entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:id', async (req, res) => {
    try {
        const { date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts } = req.body;
        await updateAssetsLiabilities(req.params.id, date, cash_bank, investments, property, vehicles, other_valuables, credit_card_debt, loans, mortgage, other_debts);
        res.redirect('/assets-liabilities');
    } catch (error) {
        console.error('Assets & Liabilities update error:', error);
        res.status(500).send('Server error: Unable to update assets & liabilities');
    }
});

/**
 * POST /assets-liabilities/delete/:id - Delete assets & liabilities entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteAssetsLiabilities(req.params.id);
        res.redirect('/assets-liabilities');
    } catch (error) {
        console.error('Assets & Liabilities delete error:', error);
        res.status(500).send('Server error: Unable to delete assets & liabilities');
    }
});

module.exports = router;