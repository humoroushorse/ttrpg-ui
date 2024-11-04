import { ChangeDetectionStrategy, Component, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EventPlanningGameSystemCreateFormComponent } from '../../forms/event-planning-game-system-create-form/event-planning-game-system-create-form.component';
import { DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';

@Component({
  selector: 'lib-event-planning-game-system-create-dialog',
  standalone: true,
  imports: [CommonModule, EventPlanningGameSystemCreateFormComponent, MatDialogModule, MatButtonModule],
  templateUrl: './event-planning-game-system-create-dialog.component.html',
  styleUrl: './event-planning-game-system-create-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSystemCreateDialogComponent {
  readonly router = inject(Router);

  readonly eventPlanningGameSystemStore = inject(EventPlanningGameSystemStore);

  readonly dialogRef = inject(DialogRef<EventPlanningGameSystemCreateDialogComponent>);

  readonly data = inject<{ routeOnCreate: boolean }>(MAT_DIALOG_DATA);

  @ViewChild(EventPlanningGameSystemCreateFormComponent) createForm!: EventPlanningGameSystemCreateFormComponent;

  private initialized = false;
  constructor() {
    effect(() => {
      // trigger close on the entities array changing (added new one)
      //    skip first instance
      this.eventPlanningGameSystemStore.entities();
      if (this.initialized) {
        this.dialogRef.close();
      }
      this.initialized = true;
    });
  }

  onSubmit() {
    this.createForm.onSubmit(this.data.routeOnCreate);
  }
}
