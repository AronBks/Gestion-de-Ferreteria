// Configuración regional para Bolivia
export const CURRENCY_CONFIG = {
  country: 'Bolivia',
  currency: 'BOB',
  symbol: 'Bs.',
  locale: 'es-BO',
  decimalSeparator: ',',
  thousandsSeparator: '.',
};

export const formatCurrencyBolivia = (amount: number): string => {
  if (isNaN(amount)) return 'Bs. 0,00';
  
  const formatter = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

export const formatNumberBolivia = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
