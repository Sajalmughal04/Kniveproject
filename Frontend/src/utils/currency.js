/**
 * Format a number as USD currency
 * @param {number} amount - The amount in USD
 * @param {object} options - Formatting options
 * @returns {string} Formatted USD string (e.g., "$200.00")
 */
export const formatUSD = (amount, options = {}) => {
  const numericAmount = Number(amount) || 0;
  const fractionDigits = options.minFractionDigits ?? 2;
  return `$${numericAmount.toFixed(fractionDigits)}`;
};

// Legacy function names kept for backward compatibility
export const toUSD = (amount) => Number(amount) || 0;
export const getUsdRate = () => 1;

