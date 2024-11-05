import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageAuthUnauthorizedComponent } from './page-auth-unauthorized.component';

describe('PageAuthUnauthorizedComponent', () => {
  let component: PageAuthUnauthorizedComponent;
  let fixture: ComponentFixture<PageAuthUnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthUnauthorizedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAuthUnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
