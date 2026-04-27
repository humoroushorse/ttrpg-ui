import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { PageProjectsListComponent } from './page-projects-list.component';
import { ProjectStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

describe('PageProjectsListComponent', () => {
  let component: PageProjectsListComponent;
  let fixture: ComponentFixture<PageProjectsListComponent>;
  let mockProjectStore: any;

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test description',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    mockProjectStore = {
      loadProjects: vi.fn(),
      delete: vi.fn(),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      projectsSorted: signal([mockProject]),
      loading: signal(false),
      error: signal(null),
      pagination: signal({ currentPage: 1, pageSize: 10, totalItems: 1, totalPages: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [PageProjectsListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProjectStore, useValue: mockProjectStore },
        {
          provide: AuthService,
          useValue: { getUserTokenDecoded: signal(null) },
        },
        {
          provide: SharedCoreService,
          useValue: { appTitle: 'Test App' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(mockProjectStore.loadProjects).toHaveBeenCalled();
  });

  it('should handle page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 20, length: 100 });
    expect(mockProjectStore.setPage).toHaveBeenCalledWith(2);
    expect(mockProjectStore.setPageSize).toHaveBeenCalledWith(20);
    expect(mockProjectStore.loadProjects).toHaveBeenCalled();
  });

  it('should toggle view between grid and list', () => {
    expect(component.currentView()).toBe('grid');
    component.toggleView();
    expect(component.currentView()).toBe('list');
    component.toggleView();
    expect(component.currentView()).toBe('grid');
  });

  it('should handle delete with confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const event = new Event('click');
    vi.spyOn(event, 'stopPropagation');

    component.onDeleteClicked('project-1', 'Test Project', event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockProjectStore.delete).toHaveBeenCalledWith('project-1');
  });

  it('should not delete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const event = new Event('click');

    component.onDeleteClicked('project-1', 'Test Project', event);

    expect(mockProjectStore.delete).not.toHaveBeenCalled();
  });
});
