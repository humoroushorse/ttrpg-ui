import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  EventPlanningApiService,
  EventPlanningGameSystemStore,
  EventPlanningGameSessionStore,
} from '@ttrpg-ui/features/event-planning/data-access';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedFormsSingleSelectComponent } from '@ttrpg-ui/shared/forms/ui';
import { SharedFormValidators } from '@ttrpg-ui/shared/forms/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { GameSystemSchema } from 'features/event-planning/models/src/lib/game-system.model';

dayjs.extend(isSameOrAfter);

@Component({
  selector: 'lib-event-planning-game-session-create-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedFormsSingleSelectComponent,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatTimepickerModule,
    MatIconModule,
  ],
  templateUrl: './event-planning-game-session-create-form.component.html',
  styleUrl: './event-planning-game-session-create-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSessionCreateFormComponent {
  readonly eventPlanningApiService = inject(EventPlanningApiService);

  readonly eventPlanningGameSystemStore = inject(EventPlanningGameSystemStore);

  readonly eventPlanningGameSessionStore = inject(EventPlanningGameSessionStore);

  readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  readonly dataTestId = 'EventPlanningGameSystemCreateForm';

  public gameSystemSearch$ = new BehaviorSubject('');

  public gameSystemsFiltered$ = combineLatest([
    this.gameSystemSearch$.pipe(startWith('')),
    toObservable(this.eventPlanningGameSystemStore.entities).pipe(startWith([])),
  ]).pipe(
    map(([search, entities]) => {
      if (!search) return entities;
      return entities.filter((e) => search.trim().toLowerCase() === e.name.toLowerCase());
    }),
  );

  readonly authService = inject(AuthService);

  readonly sharedNotificationService = inject(SharedNotificationService);

  public hideSubmitButton = input<boolean>(false);

  readonly dateNowNoTime = new Date(new Date().setHours(0, 0, 0, 0));

  readonly gameSessionFormValidation = {
    title: {
      min: 3,
      max: 50,
    },
    description: {
      min: 3,
      max: 300,
    },
    max_players: {
      min: 1,
      max: 12,
    },
    image_url_description: {
      max: 300,
    },
  };

  public gameSessionForm = new FormGroup(
    {
      game_master_id: new FormControl(this.authService.getUserTokenDecoded()()?.sub || '', [Validators.required]),
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(this.gameSessionFormValidation.title.min),
        Validators.maxLength(this.gameSessionFormValidation.title.max),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(this.gameSessionFormValidation.description.min),
        Validators.maxLength(this.gameSessionFormValidation.description.max),
      ]),
      game_system_id: new FormControl('', [Validators.required]),
      start_date: new FormControl<Date>(this.getNextTuesday(18, 0), [Validators.required]),
      end_date: new FormControl<Date>(this.getNextTuesday(21, 30), [Validators.required]),
      max_players: new FormControl(6, [
        Validators.required,
        Validators.min(this.gameSessionFormValidation.max_players.min),
        Validators.max(this.gameSessionFormValidation.max_players.max),
      ]),
      image_url: new FormControl('', []),
      image_url_description: new FormControl('', [Validators.maxLength(300)]),
      is_public: new FormControl<boolean>(true, [Validators.required]),
    },
    {
      validators: [SharedFormValidators.requiredIfOtherHasValueValidator('image_url_description', 'image_url')],
    },
  );

  public reset() {
    this.gameSessionForm.reset({
      game_master_id: this.authService.getUserTokenDecoded()()?.sub || null,
      start_date: this.getNextTuesday(18, 0),
      end_date: this.getNextTuesday(21, 30),
      max_players: 6,
      is_public: true,
    });
    this.sharedLocalStorageService.remove('EventPlanningGameSessionCreateFormComponent.gameSessionForm');
  }

  constructor() {
    // if the date is cleared, default to today
    this.gameSessionForm.controls.start_date.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((v) => {
        if (v === null) {
          this.gameSessionForm.controls.start_date.setValue(this.dateNowNoTime);
          this.sharedNotificationService.openSnackBar('No start date set, defaulted to today!', 'close');
        }
      });
    this.gameSessionForm.controls.end_date.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((v) => {
        if (v === null) {
          this.gameSessionForm.controls.end_date.setValue(this.dateNowNoTime);
          this.sharedNotificationService.openSnackBar('No end date set, defaulted to today!', 'close');
        }
      });

    const gameSessionFormStorageValue = this.sharedLocalStorageService.get<any>(
      'EventPlanningGameSessionCreateFormComponent.gameSessionForm',
    );
    if (gameSessionFormStorageValue) {
      gameSessionFormStorageValue.start_date = new Date(gameSessionFormStorageValue.start_date);
      gameSessionFormStorageValue.end_date = new Date(gameSessionFormStorageValue.end_date);
      this.gameSessionForm.setValue(gameSessionFormStorageValue as any);
      this.gameSessionForm.markAllAsTouched();
    }

    this.gameSessionForm.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((v) => {
      if (this.gameSessionForm.dirty) {
        this.sharedLocalStorageService.set('EventPlanningGameSessionCreateFormComponent.gameSessionForm', v);
      }
    });
  }

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

  public onSubmit(routeOnCreate = true) {
    if (!this.gameSessionForm.valid) {
      this.gameSessionForm.markAllAsTouched();
      return;
    }
    const value = this.gameSessionForm.value;
    const newGameSession: EventPlanningModels.GameSession.GameSessionPostInput = {
      game_master_id: value.game_master_id || '',
      title: value.title || '',
      description: value.description || '',
      game_system_id: value.game_system_id || '',
      start_date: value.end_date || new Date(),
      end_date: value.end_date || new Date(),
      is_public: value.is_public || false,
      max_players: value.max_players || 0,
      image_url: value.image_url || undefined,
      image_url_description: value.image_url_description || undefined,
    };
    if (!newGameSession.image_url) newGameSession.image_url_description = undefined;
    this.eventPlanningGameSessionStore.post(newGameSession, routeOnCreate);
  }

  public onDateChange(event: any, formControl: AbstractControl) {
    if (!event) formControl.setValue(this.dateNowNoTime);
  }

  /**
   * Because the actual *value* is a string,
   *    we compare the strings, not the objects
   *    if the vallue was an object we would compare gsX.id
   * @param gs1
   * @param gs2
   * @returns
   */
  gameSystemCompareWithFn(gs1: string, gs2: string) {
    return gs1 === gs2;
  }

  gameSystemViewValueFn(gs: GameSystemSchema) {
    return `${gs.name} (${gs.version}, ${gs.release_year})`;
  }
}
