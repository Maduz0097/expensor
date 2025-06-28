const express = require('express');
const router = express.Router();
const { getTotalIncome, getTotalExpenses, getExpenseCategories, getNetWorth, getIncomeTrend, getExpenseTrend, getLoanLeaseProgress } = require('../utils/db');
const { getDefaultDateRange } = require('../utils/dateUtils');

/**
 * GET / - Render dashboard with financial overview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query.startDate && req.query.endDate
            ? { startDate: req.query.startDate, endDate: req.query.endDate }
            : getDefaultDateRange();

        const totalIncome = await getTotalIncome(startDate, endDate);
        const totalExpenses = await getTotalExpenses(startDate, endDate);
        const expenseCategories = await getExpenseCategories(startDate, endDate);
        const netWorth = await getNetWorth();
        const incomeTrend = await getIncomeTrend(startDate, endDate);
        const expenseTrend = await getExpenseTrend(startDate, endDate);
        const loanLeaseProgress = await getLoanLeaseProgress(startDate, endDate);

        console.log('Dashboard data:', { totalIncome, totalExpenses, expenseCategories, netWorth, incomeTrend, expenseTrend, loanLeaseProgress });

        res.render('dashboard', {
            title: 'Financial Dashboard',
            totalIncome: totalIncome?.toFixed(2),
            totalExpenses: totalExpenses.toFixed(2),
            netWorth: netWorth.toFixed(2),
            expenseCategories: JSON.stringify(expenseCategories),
            incomeTrend: JSON.stringify(incomeTrend),
            expenseTrend: JSON.stringify(expenseTrend),
            loanLeaseProgress: JSON.stringify(loanLeaseProgress),
            startDate,
            endDate
        });
    } catch (error) {
        console.error('Dashboard route error:', error);
        res.status(500).send('Server error: Unable to fetch dashboard data');
    }
});

module.exports = router;