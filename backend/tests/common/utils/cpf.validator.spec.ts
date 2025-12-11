import { isValidCPF } from '@common/utils/cpf.validator';

describe('isValidCPF', () => {
  it('deve retornar true para CPF válido', () => {
    expect(isValidCPF('12345678909')).toBe(true);
    expect(isValidCPF('11144477735')).toBe(true);
    expect(isValidCPF('030.740.334-36')).toBe(true);
  });

  it('deve retornar false para CPF inválido', () => {
    expect(isValidCPF('12345678900')).toBe(false);
    expect(isValidCPF('00000000000')).toBe(false);
    expect(isValidCPF('11111111111')).toBe(false);
  });

  it('deve retornar false para CPF com menos de 11 dígitos', () => {
    expect(isValidCPF('123456789')).toBe(false);
    expect(isValidCPF('1234567890')).toBe(false);
  });

  it('deve retornar false para CPF com mais de 11 dígitos', () => {
    expect(isValidCPF('123456789012')).toBe(false);
  });

  it('deve remover caracteres não numéricos antes de validar', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true);
    expect(isValidCPF('123 456 789 09')).toBe(true);
  });

  it('deve retornar false para string vazia', () => {
    expect(isValidCPF('')).toBe(false);
  });
});
