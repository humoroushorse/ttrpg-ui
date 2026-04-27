import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CommentListComponent } from './comment-list.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type Comment = SprintModels.Comment.Comment;

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  const mockComments: Comment[] = [
    {
      id: '1',
      work_item_id: 'wi-1',
      author_id: 'user-1',
      content: 'First comment',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      work_item_id: 'wi-1',
      author_id: 'user-2',
      content: 'Second comment',
      created_at: '2024-01-01T11:00:00Z',
      updated_at: '2024-01-01T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comments', mockComments);
    fixture.componentRef.setInput('currentUserId', 'user-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort comments by timestamp descending', () => {
    const sorted = component.sortedComments();
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('should allow edit for own comments', () => {
    expect(component.canEdit(mockComments[0])).toBe(true);
    expect(component.canEdit(mockComments[1])).toBe(false);
  });

  it('should allow delete for own comments', () => {
    expect(component.canDelete(mockComments[0])).toBe(true);
    expect(component.canDelete(mockComments[1])).toBe(false);
  });

  it('should emit editComment when onEditClick is called', () => {
    const spy = vi.spyOn(component.editComment, 'emit');
    component.onEditClick(mockComments[0]);
    expect(spy).toHaveBeenCalledWith(mockComments[0]);
  });

  it('should emit deleteComment when onDeleteClick is called', () => {
    const spy = vi.spyOn(component.deleteComment, 'emit');
    component.onDeleteClick(mockComments[0]);
    expect(spy).toHaveBeenCalledWith(mockComments[0]);
  });
});
