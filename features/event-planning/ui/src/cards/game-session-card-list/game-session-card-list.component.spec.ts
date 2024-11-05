import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSessionCardListComponent } from './game-session-card-list.component';

describe('GameSessionCardListComponent', () => {
  let component: GameSessionCardListComponent;
  let fixture: ComponentFixture<GameSessionCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSessionCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSessionCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
