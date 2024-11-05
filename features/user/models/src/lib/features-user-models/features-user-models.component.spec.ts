import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesUserModelsComponent } from './features-user-models.component';

describe('FeaturesUserModelsComponent', () => {
  let component: FeaturesUserModelsComponent;
  let fixture: ComponentFixture<FeaturesUserModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesUserModelsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesUserModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
