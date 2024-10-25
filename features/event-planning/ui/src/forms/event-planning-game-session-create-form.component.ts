import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventPlanningApiService } from '@ttrpg-ui/features/event-planning/data-access';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

dayjs.extend(isSameOrAfter);

@Component({
  selector: 'lib-event-planning-game-session-create-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './event-planning-game-session-create-form.component.html',
  styleUrl: './event-planning-game-session-create-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSessionCreateFormComponent {
  private eventPlanningApiService = inject(EventPlanningApiService);

  private authService = inject(AuthService);

  public hideSubmitButton = input<boolean>(false);

  public dateNow = new Date();

  public gameSessionFg = new FormGroup({
    game_master_id: new FormControl(this.authService.getUserTokenDecoded()()?.sub || '', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    start_date: new FormControl(this.getNextTuesday(18, 0), [Validators.required]),
    end_date: new FormControl(this.getNextTuesday(21, 30), [Validators.required]),
    max_players: new FormControl(6, [Validators.required, Validators.min(1)]),
    image_url: new FormControl('', []),
    is_public: new FormControl<boolean>(true, [Validators.required]),
  });

  public getNextTuesday(hour: number, minute: number) {
    const today = dayjs();
    let nextTuesday = today.day(2); // 2 === Tuesday
    // If today is Tuesday and it's after {hour} PM, get the next Tuesday
    if (today.day() === 2 && today.isSameOrAfter(today.set('hour', hour))) {
      nextTuesday = nextTuesday.add(1, 'week');
    }
    // If today is after Tuesday, find the next Tuesday
    if (today.day() > 2) {
      nextTuesday = nextTuesday.add(1, 'week');
    }
    nextTuesday = nextTuesday.set('hour', hour).set('minute', minute).set('second', 0).set('millisecond', 0);
    return new Date(nextTuesday.toISOString());
  }

  public onSubmit() {
    if (!this.gameSessionFg.valid) return;
    const value = this.gameSessionFg.value;
    const newGameSession: EventPlanningModels.Schemas.GameSessionCreateInput = {
      game_master_id: value.game_master_id || '',
      title: value.title || '',
      description: value.description || '',
      start_date: value.end_date || new Date(),
      end_date: value.end_date || new Date(),
      is_public: value.is_public || false,
      max_players: value.max_players || 0,
      image_url: value.image_url || undefined,
    };
    this.eventPlanningApiService.addGameSession(newGameSession);
  }
}
