// Backend Configuration for Bolivia
export const COUNTRY_CONFIG = {
  name: 'Bolivia',
  isoCode: 'BO',
  language: 'es-BO',
  currency: {
    code: 'BOB',
    symbol: 'Bs.',
    name: 'Boliviano',
  },
  timezone: 'America/La_Paz',
  dateFormat: 'DD/MM/YYYY',
  decimalSeparator: ',',
  thousandsSeparator: '.',
};

// Impuestos y regulaciones de Bolivia
export const BOLIVIA_TAX_CONFIG = {
  iva: 13, // IVA en Bolivia es 13%
  retencionIVA: 13,
  retencionIT: 3, // Impuesto a las Transacciones
};

export const BUSINESS_INFO = {
  businessName: 'Ferretería Bolivia',
  country: 'Bolivia',
  currency: 'BOB',
  language: 'es',
};
