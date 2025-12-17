import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { GameSystemCardListComponent } from './game-system-card-list.component';

describe('GameSystemCardListComponent', () => {
  let component: GameSystemCardListComponent;
  let fixture: ComponentFixture<GameSystemCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSystemCardListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSystemCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
