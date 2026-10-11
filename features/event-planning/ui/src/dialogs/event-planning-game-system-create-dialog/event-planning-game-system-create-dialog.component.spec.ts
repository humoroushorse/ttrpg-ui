import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { EventPlanningGameSystemCreateDialogComponent } from './event-planning-game-system-create-dialog.component';

describe('EventPlanningGameSystemCreateDialogComponent', () => {
  let component: EventPlanningGameSystemCreateDialogComponent;
  let fixture: ComponentFixture<EventPlanningGameSystemCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSystemCreateDialogComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSystemCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
