import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-event-planning-game-system-create-form',
  imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatTooltipModule],
  templateUrl: './event-planning-game-system-create-form.component.html',
  styleUrl: './event-planning-game-system-create-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSystemCreateFormComponent {
  private readonly eventPlanningGameSystemStore = inject(EventPlanningGameSystemStore);

  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  public hideSubmitButton = input<boolean>(false);

  public gameSystemForm = new FormGroup({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    version: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    release_year: new FormControl<number | null>(null, [Validators.required]),
    description: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  constructor() {
    const gameSystemFormStorageValue = this.sharedLocalStorageService.get<any>(
      'EventPlanningGameSystemCreateFormComponent.gameSystemForm',
    );
    if (gameSystemFormStorageValue) {
      this.gameSystemForm.setValue(gameSystemFormStorageValue as any);
      this.gameSystemForm.markAllAsTouched();
    }

    this.gameSystemForm.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((v) => {
      if (this.gameSystemForm.dirty) {
        this.sharedLocalStorageService.set('EventPlanningGameSystemCreateFormComponent.gameSystemForm', v);
      }
    });
  }

  public reset() {
    this.gameSystemForm.reset();
    this.sharedLocalStorageService.remove('EventPlanningGameSystemCreateFormComponent.gameSystemForm');
  }

  public onSubmit(routeOnCreate = true) {
    if (!this.gameSystemForm.valid) {
      this.gameSystemForm.markAllAsTouched();
      return;
    }
    const value = this.gameSystemForm.value;
    const newEntity: EventPlanningModels.GameSystem.GameSystemPostInput = {
      name: value.name || '',
      version: value.version || '',
      release_year: value.release_year || 0,
      description: value.description || '',
    };
    this.eventPlanningGameSystemStore.post({ newEntity, routeOnCreate });
  }
}
