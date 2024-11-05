import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSessionCardComponent } from './game-session-card.component';

describe('GameSessionCardComponent', () => {
  let component: GameSessionCardComponent;
  let fixture: ComponentFixture<GameSessionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSessionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSessionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
