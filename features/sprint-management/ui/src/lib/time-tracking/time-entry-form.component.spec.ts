import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TimeEntryFormComponent } from './time-entry-form.component';
import { ComponentRef } from '@angular/core';

describe('TimeEntryFormComponent', () => {
  let component: TimeEntryFormComponent;
  let componentRef: ComponentRef<TimeEntryFormComponent>;
  let fixture: ComponentFixture<TimeEntryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeEntryFormComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEntryFormComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('workItemId', 'wi-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default date and empty fields', () => {
    expect(component.form.controls.date.value).toBeInstanceOf(Date);
    expect(component.form.controls.hours.value).toBeNull();
    expect(component.form.controls.description.value).toBe('');
  });

  it('should require hours', () => {
    component.form.controls.hours.setValue(null);
    component.form.controls.hours.markAsTouched();
    expect(component.form.controls.hours.valid).toBe(false);
  });

  it('should reject hours <= 0', () => {
    component.form.controls.hours.setValue(0);
    component.form.controls.hours.markAsTouched();
    expect(component.form.controls.hours.valid).toBe(false);
  });

  it('should accept valid hours', () => {
    component.form.controls.hours.setValue(2.5);
    expect(component.form.controls.hours.valid).toBe(true);
  });

  it('should enforce max 500 chars on description', () => {
    component.form.controls.description.setValue('a'.repeat(501));
    component.form.controls.description.markAsTouched();
    expect(component.form.controls.description.valid).toBe(false);
  });

  it('should accept description within limit', () => {
    component.form.controls.description.setValue('a'.repeat(500));
    expect(component.form.controls.description.valid).toBe(true);
  });

  it('should require date', () => {
    component.form.controls.date.setValue(null as any);
    component.form.controls.date.markAsTouched();
    expect(component.form.controls.date.valid).toBe(false);
  });

  it('should not be in edit mode by default', () => {
    expect(component.isEditMode()).toBe(false);
    expect(component.getSubmitButtonText()).toBe('Log Time');
  });

  it('should be in edit mode when entry is provided', () => {
    componentRef.setInput('entry', {
      id: 'te-1',
      work_item_id: 'wi-1',
      user_id: 'user-1',
      hours: 3,
      description: 'Existing',
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    });
    fixture.detectChanges();

    expect(component.isEditMode()).toBe(true);
    expect(component.getSubmitButtonText()).toBe('Update Entry');
  });

  it('should emit submitEntry on valid form submission', () => {
    let emitted: any = null;
    component.submitEntry.subscribe((val: any) => (emitted = val));

    component.form.controls.hours.setValue(2);
    component.form.controls.description.setValue('Did work');
    component.onSubmit();

    expect(emitted).toBeTruthy();
    expect(emitted.work_item_id).toBe('wi-1');
    expect(emitted.hours).toBe(2);
  });

  it('should not emit on invalid form', () => {
    let emitted = false;
    component.submitEntry.subscribe(() => (emitted = true));

    component.form.controls.hours.setValue(null);
    component.onSubmit();

    expect(emitted).toBe(false);
  });
});
