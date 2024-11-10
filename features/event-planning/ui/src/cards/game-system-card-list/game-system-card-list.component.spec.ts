import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSystemCardListComponent } from './game-system-card-list.component';

describe('GameSystemCardListComponent', () => {
  let component: GameSystemCardListComponent;
  let fixture: ComponentFixture<GameSystemCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSystemCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSystemCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
