const moment = require('moment');

/**
 * Validate and return date range from query parameters
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Validated startDate and endDate
 * @throws {Error} If dates are invalid or startDate > endDate
 */
const validateDateRange = (startDate, endDate) => {
    const defaultRange = getDefaultDateRange();
    const format = 'YYYY-MM-DD';

    // Use default range if not provided or invalid
    if (!startDate || !endDate || !moment(startDate, format, true).isValid() || !moment(endDate, format, true).isValid()) {
        return defaultRange;
    }

    const start = moment(startDate, format);
    const end = moment(endDate, format);

    if (start.isAfter(end)) {
        throw new Error('startDate must be before endDate');
    }

    return { startDate: start.format(format), endDate: end.format(format) };
};

/**
 * Get default date range (last 6 months)
 * @returns {Object} Default startDate and endDate
 */
const getDefaultDateRange = () => {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
    return { startDate, endDate };
};

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month
 */
const getCurrentMonth = () => {
    return moment().format('YYYY-MM');
};

/**
 * Generate array of months between startDate and endDate
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array<string>} Array of months in YYYY-MM format
 */
const generateMonths = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const months = [];
    while (start.isSameOrBefore(end, 'month')) {
        months.push(start.format('YYYY-MM'));
        start.add(1, 'month');
    }
    return months.reverse(); // Oldest to newest
};

module.exports = { validateDateRange, getDefaultDateRange, getCurrentMonth, generateMonths };