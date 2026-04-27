import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SprintFormComponent } from './sprint-form.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;

describe('SprintFormComponent', () => {
  let component: SprintFormComponent;
  let fixture: ComponentFixture<SprintFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintFormComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('status')?.value).toBe(SprintStatus.Planning);
  });

  it('should mark form as invalid when name is empty', () => {
    component.form.patchValue({ name: '' });
    expect(component.form.valid).toBe(false);
  });

  it('should mark form as valid when required fields are filled', () => {
    component.form.patchValue({
      name: 'Sprint 1',
      status: SprintStatus.Planning,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-14'),
    });
    expect(component.form.valid).toBe(true);
  });

  it('should emit formSubmit when form is submitted', () => {
    let emittedValue: any;
    component.formSubmitted.subscribe((value) => {
      emittedValue = value;
    });

    component.form.patchValue({
      name: 'Sprint 1',
      status: SprintStatus.Planning,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-14'),
    });

    component.onSubmit();

    expect(emittedValue).toBeDefined();
    expect(emittedValue.name).toBe('Sprint 1');
  });

  it('should not emit formSubmit when form is invalid', () => {
    let emitted = false;
    component.formSubmitted.subscribe(() => {
      emitted = true;
    });

    component.form.patchValue({ name: '' });
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('should emit formCancel when cancel is clicked', () => {
    let emitted = false;
    component.cancelled.subscribe(() => {
      emitted = true;
    });

    component.onCancel();

    expect(emitted).toBe(true);
  });
});
