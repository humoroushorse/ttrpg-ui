import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedAngularMaterialTableComponent } from './shared-angular-material-table.component';

describe('SharedAngularMaterialTableComponent', () => {
  let component: SharedAngularMaterialTableComponent<any>;
  let fixture: ComponentFixture<SharedAngularMaterialTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedAngularMaterialTableComponent],
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedAngularMaterialTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
