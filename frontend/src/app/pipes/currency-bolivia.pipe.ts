import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrencyBolivia } from '../config/currency.config';

@Pipe({
  name: 'currencyBolivia',
  standalone: true
})
export class CurrencyBoliviaPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value === null || value === undefined) return 'Bs. 0,00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return formatCurrencyBolivia(numValue);
  }
}
