const express = require('express');
const router = express.Router();

// Import sub-routes
const dashboardRoutes = require('./dashboard');
const incomeRoutes = require('./income');
const expensesRoutes = require('./expenses');
const savingsRoutes = require('./savings');
const budgetRoutes = require('./budget');
const assetsLiabilitiesRoutes = require('./assetsLiabilities');

// Mount sub-routes
router.use('/', dashboardRoutes);
router.use('/income', incomeRoutes);
router.use('/expenses', expensesRoutes);
router.use('/savings', savingsRoutes);
router.use('/budget', budgetRoutes);
router.use('/assets-liabilities', assetsLiabilitiesRoutes);

module.exports = router;