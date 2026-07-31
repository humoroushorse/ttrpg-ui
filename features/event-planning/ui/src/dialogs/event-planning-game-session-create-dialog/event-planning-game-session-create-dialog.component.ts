import { Component, effect, inject, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { EventPlanningGameSessionCreateFormComponent } from '../../forms/event-planning-game-session-create-form/event-planning-game-session-create-form.component';
import { MatButtonModule } from '@angular/material/button';
import { EventPlanningGameSessionStore } from '@ttrpg-ui/features/event-planning/data-access';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'lib-event-planning-game-session-create-dialog',
  imports: [EventPlanningGameSessionCreateFormComponent, MatDialogModule, MatButtonModule],
  templateUrl: './event-planning-game-session-create-dialog.component.html',
  styleUrl: './event-planning-game-session-create-dialog.component.scss',
})
export class EventPlanningGameSessionCreateDialogComponent {
  private readonly eventPlanningGameSessionStore = inject(EventPlanningGameSessionStore);

  private readonly dialogRef = inject(DialogRef<EventPlanningGameSessionCreateDialogComponent>);

  private readonly data = inject<{ routeOnCreate: boolean }>(MAT_DIALOG_DATA);

  @ViewChild(EventPlanningGameSessionCreateFormComponent) createForm!: EventPlanningGameSessionCreateFormComponent;

  private initialized = false;
  constructor() {
    effect(() => {
      // trigger close on the entities array changing (added new one)
      //    skip first instance
      this.eventPlanningGameSessionStore.entities();
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
