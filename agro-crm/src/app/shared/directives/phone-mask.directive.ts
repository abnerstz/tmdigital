import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]',
  standalone: true
})
export class PhoneMaskDirective {
  private el = inject(ElementRef);
  private control = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substr(0, 11);
    }
    
    const maskedValue = this.applyMask(value);
    
    if (this.control?.control) {
      this.control.control.setValue(maskedValue, { emitEvent: true });
    } else {
      input.value = maskedValue;
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value.length >= 10) {
      const maskedValue = this.applyMask(value);
      if (this.control?.control) {
        this.control.control.setValue(maskedValue, { emitEvent: true });
      }
    }
  }

  private applyMask(value: string): string {
    if (value.length === 0) return '';
    
    if (value.length > 10) {
      return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      return value.replace(/(\d{2})(\d+)/, '($1) $2');
    } else {
      return value.replace(/(\d+)/, '($1');
    }
  }
}

