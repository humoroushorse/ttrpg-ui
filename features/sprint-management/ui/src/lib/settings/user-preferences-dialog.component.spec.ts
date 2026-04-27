import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { UserPreferencesDialogComponent } from './user-preferences-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';

describe('UserPreferencesDialogComponent', () => {
  let component: UserPreferencesDialogComponent;
  let fixture: ComponentFixture<UserPreferencesDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserPreferencesDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN, useValue: { namespace: 'test' } },
        { provide: SHARED_THEME_SERVICE_CONFIG_TOKEN, useValue: { themes: [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPreferencesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when cancel is called', () => {
    // cancel() is protected — trigger via the template button or call directly via type cast
    (component as any).cancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should save preferences and close dialog when save is called', () => {
    (component as any).save();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
