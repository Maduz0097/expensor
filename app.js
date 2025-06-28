const express = require('express');
const path = require('path');
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expenses');
const savingsRoutes = require('./routes/savings');
const budgetRoutes = require('./routes/budget');
const assetsLiabilitiesRoutes = require('./routes/assetsLiabilities');
const loansLeasesRoutes = require('./routes/loansLeases');
const indexRoutes = require('./routes/index');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', indexRoutes);
app.use('/income', incomeRoutes);
app.use('/expenses', expenseRoutes);
app.use('/savings', savingsRoutes);
app.use('/budget', budgetRoutes);
app.use('/assets-liabilities', assetsLiabilitiesRoutes);
app.use('/loans-leases', loansLeasesRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});