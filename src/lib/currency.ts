/**
 * Currency helpers for formatting prices and resolving currency symbols
 * across the CMS based on the store's registered / active currency.
 */

export const getCurrencySymbol = (currencyCode?: string | null): string => {
  if (!currencyCode) return '₹';
  const c = currencyCode.toUpperCase().trim();
  switch (c) {
    case 'INR':
    case '₹':
    case 'RUPEE':
    case 'RS':
    case 'RS.':
      return '₹';
    case 'USD':
    case '$':
      return '$';
    case 'EUR':
    case '€':
      return '€';
    case 'GBP':
    case '£':
      return '£';
    case 'JPY':
    case '¥':
    case 'CNY':
      return '¥';
    case 'AUD':
      return 'A$';
    case 'CAD':
      return 'CA$';
    case 'SGD':
      return 'S$';
    case 'AED':
      return 'د.إ ';
    default:
      return c.length <= 3 ? `${c} ` : '$';
  }
};

export const formatPrice = (
  amount: number | string | undefined | null,
  currencyCode?: string | null,
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toFixed(2)}`;
};
