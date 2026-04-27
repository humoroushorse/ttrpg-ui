import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DependencyGraphComponent } from './dependency-graph.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type Dependency = SprintModels.Dependency.Dependency;
type WorkItem = SprintModels.WorkItem.WorkItem;

describe('DependencyGraphComponent', () => {
  let component: DependencyGraphComponent;
  let fixture: ComponentFixture<DependencyGraphComponent>;

  const mockWorkItems: WorkItem[] = [
    {
      id: '1',
      title: 'Work Item 1',
      description: 'Description 1',
      type: 'story' as any,
      status: 'todo' as any,
      priority: 'medium' as any,
      project_id: 'proj-1',
      assignee_id: null,
      sprint_id: null,
      parent_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: 'user-1',
      updated_by: 'user-1',
    },
    {
      id: '2',
      title: 'Work Item 2',
      description: 'Description 2',
      type: 'story' as any,
      status: 'todo' as any,
      priority: 'medium' as any,
      project_id: 'proj-1',
      assignee_id: null,
      sprint_id: null,
      parent_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: 'user-1',
      updated_by: 'user-1',
    },
  ];

  const mockDependencies: Dependency[] = [
    {
      id: '1',
      source_work_item_id: '1',
      target_work_item_id: '2',
      dependency_type: 'blocks' as any,
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'user-1',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependencyGraphComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DependencyGraphComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dependencies', mockDependencies);
    fixture.componentRef.setInput('workItems', mockWorkItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build dependency nodes', () => {
    const nodes = component.dependencyNodes();
    expect(nodes.length).toBe(2);
  });

  it('should identify blocking nodes', () => {
    const blocking = component.blockingNodes();
    expect(blocking.length).toBe(1);
    expect(blocking[0].workItem.id).toBe('1');
  });

  it('should identify blocked nodes', () => {
    const blocked = component.blockedNodes();
    expect(blocked.length).toBe(1);
    expect(blocked[0].workItem.id).toBe('2');
  });

  it('should emit workItemClick when node is clicked', () => {
    const spy = vi.spyOn(component.workItemClick, 'emit');
    const node = component.dependencyNodes()[0];
    component.onWorkItemClick(node);
    expect(spy).toHaveBeenCalledWith(node.workItem);
  });
});
