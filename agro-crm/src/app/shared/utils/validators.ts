import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de CPF
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = control.value?.replace(/\D/g, '');
    
    if (!cpf) {
      return null; // Se vazio, deixa o required handle
    }
    
    if (cpf.length !== 11) {
      return { cpf: { value: control.value, message: 'CPF deve ter 11 dígitos' } };
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpf: { value: control.value, message: 'CPF inválido' } };
    }
    
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) {
      return { cpf: { value: control.value, message: 'CPF inválido' } };
    }
    
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) {
      return { cpf: { value: control.value, message: 'CPF inválido' } };
    }
    
    return null;
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const phone = String(control.value).replace(/\D/g, '');
    
    if (!phone || phone.length === 0) {
      return null;
    }
    
    if (phone.length >= 10 && phone.length <= 11) {
      return null;
    }
    
    return { phone: { value: control.value, message: 'Telefone inválido' } };
  };
}

/**
 * Validador de área mínima
 */
export function minAreaValidator(minArea: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    if (value < minArea) {
      return { minArea: { value, minArea, message: `Área mínima: ${minArea} ha` } };
    }
    
    return null;
  };
}

