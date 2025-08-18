import { Model } from '../models/model';

export const StringUtils = {
  uniqueKey: <T extends Model>(constructor: new () => T, id: string) => {
    const entityName = constructor.name
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    return `${entityName}-${id}`;
  },

  Name: {
    full_name: (hasName: { first_name: string; middle_name: string; last_name: string }) => {
      return [hasName.first_name, hasName.middle_name, hasName.last_name].filter(Boolean).join(' ');
    }
  },

  Display: {
    capitalize: (str: string | null): string => {
      return !str ? '' : str.charAt(0).toUpperCase() + str.slice(1);
    },
    currency: (amount: number, fractionDigits: number = 0, currency: string = 'USD', locale: string = 'en-US'): string => {
      return amount === null || amount === undefined
        ? ''
        : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        }).format(amount);
    },
    toLocaleString: (date: string | Date): string => {
      return date && new Date(date).toLocaleString();
    },
    toLocaleDateString: (date: string | Date): string => {
      return date && new Date(date).toLocaleDateString();
    },
    toLocaleTimeString: (date: string | Date): string => {
      return date && new Date(date).toLocaleTimeString();
    }
  }
};