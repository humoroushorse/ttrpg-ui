import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CommentFormComponent } from './comment-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be in edit mode by default', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should emit submitComment when form is valid and submitted', () => {
    const spy = vi.spyOn(component.submitComment, 'emit');
    component.form.patchValue({ content: 'Test comment' });
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith('Test comment');
  });

  it('should not emit submitComment when form is invalid', () => {
    const spy = vi.spyOn(component.submitComment, 'emit');
    component.form.patchValue({ content: '' });
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit cancelEdit when onCancel is called', () => {
    const spy = vi.spyOn(component.cancelEdit, 'emit');
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should switch to preview tab', () => {
    component.showPreview();
    expect(component.selectedTabIndex()).toBe(1);
  });

  it('should switch to write tab', () => {
    component.showPreview();
    component.showWrite();
    expect(component.selectedTabIndex()).toBe(0);
  });
});
