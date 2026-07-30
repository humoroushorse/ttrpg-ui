import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, ViewChild } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-tag-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagInputComponent {
  availableTags = input<string[]>([]);
  currentTags = input<string[]>([]);
  placeholder = input<string>('Add a tag...');

  tagAdded = output<string>();
  tagRemoved = output<string>();

  tagInputControl = new FormControl('');

  @ViewChild('tagInputEl') tagInputEl!: ElementRef<HTMLInputElement>;

  filteredTags = computed(() => {
    const inputValue = (this.tagInputControl.value ?? '').toLowerCase().trim();
    const current = this.currentTags();
    return this.availableTags()
      .filter((tag) => !current.includes(tag))
      .filter((tag) => !inputValue || tag.toLowerCase().includes(inputValue));
  });

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addFromInput();
    }
  }

  onAutocompleteSelected(event: MatAutocompleteSelectedEvent): void {
    const tag = event.option.value as string;
    this.emitTagAdded(tag);
    this.tagInputControl.setValue('');
    if (this.tagInputEl) {
      this.tagInputEl.nativeElement.value = '';
    }
  }

  addFromInput(): void {
    const value = (this.tagInputControl.value ?? '').trim();
    if (value) {
      this.emitTagAdded(value);
      this.tagInputControl.setValue('');
      if (this.tagInputEl) {
        this.tagInputEl.nativeElement.value = '';
      }
    }
  }

  removeTag(tag: string): void {
    this.tagRemoved.emit(tag);
  }

  private emitTagAdded(tag: string): void {
    if (tag && !this.currentTags().includes(tag)) {
      this.tagAdded.emit(tag);
    }
  }
}
