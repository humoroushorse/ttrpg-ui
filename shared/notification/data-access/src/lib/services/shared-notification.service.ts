import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SharedNotificationService {
  readonly snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action?: string, config?: MatSnackBarConfig) {
    if (!config) config = { duration: 3000 };
    this.snackBar.open(message, action, config);
  }
}
