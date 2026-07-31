import { Component, effect, inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EventPlanningGameSystemCreateFormComponent } from '../../forms/event-planning-game-system-create-form/event-planning-game-system-create-form.component';
import { DialogRef } from '@angular/cdk/dialog';
import { EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';

@Component({
  selector: 'lib-event-planning-game-system-create-dialog',
  imports: [EventPlanningGameSystemCreateFormComponent, MatDialogModule, MatButtonModule],
  templateUrl: './event-planning-game-system-create-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-planning-game-system-create-dialog.component.scss',
})
export class EventPlanningGameSystemCreateDialogComponent {
  private readonly eventPlanningGameSystemStore = inject(EventPlanningGameSystemStore);

  private readonly dialogRef = inject(DialogRef<EventPlanningGameSystemCreateDialogComponent>);

  private readonly data = inject<{ routeOnCreate: boolean }>(MAT_DIALOG_DATA);

  @ViewChild(EventPlanningGameSystemCreateFormComponent) createForm!: EventPlanningGameSystemCreateFormComponent;

  private initialized = false;
  constructor() {
    effect(() => {
      // trigger close on the entities array changing (added new one)
      //    skip first instance
      this.eventPlanningGameSystemStore.entities();
      if (this.initialized) {
        this.createForm.reset();
        this.dialogRef.close();
      }
      this.initialized = true;
    });
  }

  onSubmit() {
    this.createForm.onSubmit(this.data.routeOnCreate);
  }
}
