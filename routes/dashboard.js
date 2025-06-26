const express = require('express');
const router = express.Router();
const { getTotalIncome, getTotalExpenses, getExpenseCategories, getNetWorth, getIncomeTrend, getExpenseTrend } = require('../utils/db');
const { validateDateRange, getDefaultDateRange, generateMonths } = require('../utils/dateUtils');

/**
 * GET / - Render the dashboard with metrics and charts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        // Get and validate date range from query params
        const { startDate, endDate } = validateDateRange(req.query.startDate, req.query.endDate);

        // Fetch metrics
        const totalIncome = await getTotalIncome(startDate, endDate);
        const totalExpenses = await getTotalExpenses(startDate, endDate);
        const categories = await getExpenseCategories(startDate, endDate);
        const netWorth = await getNetWorth();
        const incomeTrend = await getIncomeTrend(startDate, endDate);
        const expenseTrend = await getExpenseTrend(startDate, endDate);

        // Generate months for trend data
        const months = generateMonths(startDate, endDate);
        const incomeData = months.map(month => {
            const record = incomeTrend.find(r => r.month === month);
            return { x: month, y: record ? record.total_income || 0 : 0 };
        });
        const expenseData = months.map(month => {
            const record = expenseTrend.find(r => r.month === month);
            return { x: month, y: record ? record.total_expenses || 0 : 0 };
        });

        // Calculate derived metrics
        const netFlow = totalIncome - totalExpenses;
        const savingsRate = totalIncome ? ((netFlow / totalIncome) * 100).toFixed(2) : 0;

        // Render dashboard
        res.render('dashboard', {
            title: 'Dashboard',
            totalIncome,
            totalExpenses,
            netFlow,
            savingsRate,
            netWorth,
            categories,
            incomeTrend: incomeData,
            expenseTrend: expenseData,
            startDate,
            endDate
        });
    } catch (error) {
        console.error('Dashboard route error:', error);
        res.status(500).send('Server error: Unable to load dashboard');
    }
});

module.exports = router;