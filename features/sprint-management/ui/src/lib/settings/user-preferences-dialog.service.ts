import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserPreferencesDialogComponent } from './user-preferences-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesDialogService {
  private readonly dialog = inject(MatDialog);

  open(): MatDialogRef<UserPreferencesDialogComponent, boolean> {
    return this.dialog.open(UserPreferencesDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
    });
  }
}
