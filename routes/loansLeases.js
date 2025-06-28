const express = require('express');
const router = express.Router();
const { getAllLoansLeases, getLoanLeaseById, insertLoanLease, updateLoanLease, deleteLoanLease } = require('../utils/db');

/**
 * GET /loans-leases - Fetch and render loans and leases
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/', async (req, res) => {
    try {
        const loansLeases = await getAllLoansLeases();
        res.render('loans_leases', { title: 'Loans & Leases', loansLeases, editLoanLease: null });
    } catch (error) {
        console.error('Loans/Leases fetch error:', error);
        res.status(500).send('Server error: Unable to fetch loans and leases');
    }
});

/**
 * GET /loans-leases/edit/:id - Render edit form for loan/lease
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/edit/:id', async (req, res) => {
    try {
        const loanLease = await getLoanLeaseById(req.params.id);
        if (!loanLease) {
            return res.status(404).send('Loan/Lease record not found');
        }
        res.render('loans_leases', { title: 'Edit Loan/Lease', loansLeases: await getAllLoansLeases(), editLoanLease: loanLease });
    } catch (error) {
        console.error('Loan/Lease edit fetch error:', error);
        res.status(500).send('Server error: Unable to fetch loan/lease record');
    }
});

/**
 * POST /loans-leases - Add new loan/lease
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/', async (req, res) => {
    try {
        const { name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes } = req.body;
        await insertLoanLease(name, type, parseFloat(total_amount), parseFloat(monthly_installment), parseFloat(remaining_balance), start_date, end_date, notes);
        res.redirect('/loans-leases');
    } catch (error) {
        console.error('Loans/Leases insert error:', error);
        res.status(500).send('Server error: Unable to add loan/lease');
    }
});

/**
 * POST /loans-leases/edit/:id - Update loan/lease
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/edit/:id', async (req, res) => {
    try {
        const { name, type, total_amount, monthly_installment, remaining_balance, start_date, end_date, notes } = req.body;
        await updateLoanLease(
            req.params.id,
            name,
            type,
            parseFloat(total_amount),
            parseFloat(monthly_installment),
            parseFloat(remaining_balance),
            start_date,
            end_date,
            notes
        );
        res.redirect('/loans-leases');
    } catch (error) {
        console.error('Loan/Lease update error:', error);
        res.status(500).send('Server error: Unable to update loan/lease');
    }
});

/**
 * POST /loans-leases/delete/:id - Delete loan/lease
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/delete/:id', async (req, res) => {
    try {
        await deleteLoanLease(req.params.id);
        res.redirect('/loans-leases');
    } catch (error) {
        console.error('Loan/Lease delete error:', error);
        res.status(500).send('Server error: Unable to delete loan/lease');
    }
});

module.exports = router;