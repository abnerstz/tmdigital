import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata telefone celular: (00) 00000-0000
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Formata telefone fixo: (00) 0000-0000
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  }
}

