import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * If controlName has a value then otherControlName will get the 'requrired' error if it does not have a vlue
 * @param controlName
 * @param otherControlName
 * @returns
 */
export function requiredIfOtherHasValueValidator(controlName: string, otherControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const otherControl = formGroup.get(otherControlName);

    if (!control || !otherControl) {
      return null;
    }

    if (control.value && !otherControl.value) {
      otherControl.setErrors({ required: true });
    } else {
      otherControl.setErrors(null);
    }

    return null;
  };
}
