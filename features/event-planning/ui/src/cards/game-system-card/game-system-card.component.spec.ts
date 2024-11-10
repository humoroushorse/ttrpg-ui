import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSystemCardComponent } from './game-system-card.component';

describe('GameSystemCardComponent', () => {
  let component: GameSystemCardComponent;
  let fixture: ComponentFixture<GameSystemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSystemCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSystemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
