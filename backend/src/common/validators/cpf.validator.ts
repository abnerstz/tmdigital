import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { isValidCPF } from '../utils/cpf.validator';

export function IsValidCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return isValidCPF(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'CPF must be a valid Brazilian CPF';
        },
      },
    });
  };
}
