import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { EventPlanningGameSessionCreateFormComponent } from '../forms/event-planning-game-session-create-form.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-event-planning-game-session-create-dialog',
  standalone: true,
  imports: [CommonModule, EventPlanningGameSessionCreateFormComponent, MatDialogModule, MatButtonModule],
  templateUrl: './event-planning-game-session-create-dialog.component.html',
  styleUrl: './event-planning-game-session-create-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSessionCreateDialogComponent {
  @ViewChild(EventPlanningGameSessionCreateFormComponent) createForm!: EventPlanningGameSessionCreateFormComponent;

  onSubmit() {
    this.createForm.onSubmit();
  }
}
