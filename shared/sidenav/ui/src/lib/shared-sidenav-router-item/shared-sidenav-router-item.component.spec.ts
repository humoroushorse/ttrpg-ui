import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedSidenavRouterItemComponent } from './shared-sidenav-router-item.component';

describe('SharedSidenavRouterItemComponent', () => {
  let component: SharedSidenavRouterItemComponent;
  let fixture: ComponentFixture<SharedSidenavRouterItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSidenavRouterItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedSidenavRouterItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
