import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { WorkItemDialogComponent } from './work-item-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;

describe('WorkItemDialogComponent', () => {
  let component: WorkItemDialogComponent;
  let fixture: ComponentFixture<WorkItemDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [WorkItemDialogComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: '/api/v1',
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when onCancel is called', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog when close is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
