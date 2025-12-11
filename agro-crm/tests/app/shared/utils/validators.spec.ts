import { FormControl } from '@angular/forms';
import { cpfValidator, phoneValidator, minAreaValidator } from 'src/app/shared/utils/validators';

describe('Validators', () => {
  describe('cpfValidator', () => {
    it('deve retornar null para CPF válido', () => {
      const control = new FormControl('12345678909');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar null para CPF válido com formatação', () => {
      const control = new FormControl('123.456.789-09');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar erro para CPF inválido', () => {
      const control = new FormControl('12345678900');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['cpf']).toBeDefined();
    });

    it('deve retornar erro para CPF com menos de 11 dígitos', () => {
      const control = new FormControl('123456789');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['cpf']).toBeDefined();
    });

    it('deve retornar erro para CPF com todos os dígitos iguais', () => {
      const control = new FormControl('11111111111');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['cpf']).toBeDefined();
    });

    it('deve retornar null para valor vazio', () => {
      const control = new FormControl('');
      const validator = cpfValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('phoneValidator', () => {
    it('deve retornar null para telefone válido com 10 dígitos', () => {
      const control = new FormControl('3198765432');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar null para telefone válido com 11 dígitos', () => {
      const control = new FormControl('31987654321');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar null para telefone formatado', () => {
      const control = new FormControl('(31) 98765-4321');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar erro para telefone com menos de 10 dígitos', () => {
      const control = new FormControl('123456789');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['phone']).toBeDefined();
    });

    it('deve retornar erro para telefone com mais de 11 dígitos', () => {
      const control = new FormControl('123456789012');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['phone']).toBeDefined();
    });

    it('deve retornar null para valor vazio', () => {
      const control = new FormControl('');
      const validator = phoneValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('minAreaValidator', () => {
    it('deve retornar null para área maior que o mínimo', () => {
      const control = new FormControl(100);
      const validator = minAreaValidator(50);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar null para área igual ao mínimo', () => {
      const control = new FormControl(50);
      const validator = minAreaValidator(50);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar erro para área menor que o mínimo', () => {
      const control = new FormControl(30);
      const validator = minAreaValidator(50);
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['minArea']).toBeDefined();
    });

    it('deve retornar null para valor vazio', () => {
      const control = new FormControl('');
      const validator = minAreaValidator(50);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('deve retornar null para valor null', () => {
      const control = new FormControl(null);
      const validator = minAreaValidator(50);
      const result = validator(control);
      expect(result).toBeNull();
    });
  });
});

