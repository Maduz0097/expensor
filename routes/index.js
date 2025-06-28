const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const defaultEnd = new Date().toISOString().split('T')[0];
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30); // 30 days ago
        const defaultStartFormatted = defaultStart.toISOString().split('T')[0];

        // Use query parameters if provided, else defaults
        const start = startDate || defaultStartFormatted;
        const end = endDate || defaultEnd;

        // Calculate totals
        const incomeResult = await db.queryOne(
            'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date BETWEEN ? AND ?',
            [start, end]
        );
        const expenseResult = await db.queryOne(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?',
            [start, end]
        );
        const savingsResult = await db.queryOne(
            'SELECT COALESCE(SUM(contribution), 0) as total FROM savings WHERE date BETWEEN ? AND ?',
            [start, end]
        );
        const netWorthResult = await db.queryOne(
            'SELECT COALESCE(SUM(cash_bank + investments + property + vehicles + other_valuables - credit_card_debt - loans - mortgage - other_debts), 0) as total FROM assets_liabilities',
            []
        );

        const totalIncome = parseFloat(incomeResult.total) || 0;
        const totalExpenses = parseFloat(expenseResult.total) || 0;
        const netFlow = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0;
        const netWorth = parseFloat(netWorthResult.total) || 0;

        // Fetch trend data
        const incomeTrend = await db.queryAll(
            `SELECT strftime('%Y-%m', date) as x, COALESCE(SUM(amount), 0) as y FROM income WHERE date BETWEEN ? AND ? GROUP BY x ORDER BY x`,
            [start, end]
        );
        const expenseTrend = await db.queryAll(
            `SELECT strftime('%Y-%m', date) as x, COALESCE(SUM(amount), 0) as y FROM expenses WHERE date BETWEEN ? AND ? GROUP BY x ORDER BY x`,
            [start, end]
        );
        const categories = await db.queryAll(
            'SELECT category, COALESCE(SUM(amount), 0) as amount FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category',
            [start, end]
        );
        const loanLeaseProgress = await db.getLoanLeaseProgress(start, end);

        console.log('Dashboard data:', { totalIncome, totalExpenses, netFlow, savingsRate, netWorth, incomeTrend, expenseTrend, categories, loanLeaseProgress, start, end });

        res.render('dashboard', {
            title: 'Personal Finance Dashboard',
            totalIncome,
            totalExpenses,
            netFlow,
            savingsRate,
            netWorth,
            incomeTrend,
            expenseTrend,
            categories,
            loanLeaseProgress, // Raw array
            startDate: start,
            endDate: end
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;