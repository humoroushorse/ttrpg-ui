import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { GameSessionCardListComponent } from './game-session-card-list.component';

describe('GameSessionCardListComponent', () => {
  let component: GameSessionCardListComponent;
  let fixture: ComponentFixture<GameSessionCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSessionCardListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSessionCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
