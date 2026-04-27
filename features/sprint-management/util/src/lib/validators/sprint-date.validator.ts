import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function sprintDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('start_date')?.value;
    const endDate = control.get('end_date')?.value;

    if (!startDate || !endDate) {
      return null; // Don't validate if either date is missing
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return { sprintDateInvalid: { message: 'End date must be after start date' } };
    }

    return null;
  };
}
