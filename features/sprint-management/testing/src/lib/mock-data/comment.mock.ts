/**
 * Comment Mock Data Generators
 *
 * Provides mock data generators for comments.
 */

import { Comment, CommentWithAuthor } from '@ttrpg-ui/features/sprint-management/models';
import { generateMockId, createMockUser } from './work-item.mock';

/**
 * Create a mock comment with default values
 */
export function createMockComment(overrides?: Partial<Comment>): Comment {
  const id = generateMockId();
  const now = new Date().toISOString();

  return {
    id,
    work_item_id: 'work-item-1',
    content: `This is comment ${id}`,
    author_id: 'user-1',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Create a mock comment with author information
 */
export function createMockCommentWithAuthor(overrides?: Partial<CommentWithAuthor>): CommentWithAuthor {
  const comment = createMockComment(overrides);
  const author = overrides?.author || createMockUser({ id: comment.author_id });

  return {
    ...comment,
    author,
  };
}

/**
 * Create multiple mock comments
 */
export function createMockComments(count: number, overrides?: Partial<Comment>): Comment[] {
  return Array.from({ length: count }, () => createMockComment(overrides));
}

/**
 * Create multiple mock comments with authors
 */
export function createMockCommentsWithAuthors(
  count: number,
  overrides?: Partial<CommentWithAuthor>,
): CommentWithAuthor[] {
  return Array.from({ length: count }, () => createMockCommentWithAuthor(overrides));
}

/**
 * Create a comment with specific timestamp
 */
export function createMockCommentWithTimestamp(timestamp: Date, overrides?: Partial<Comment>): Comment {
  return createMockComment({
    created_at: timestamp.toISOString(),
    updated_at: timestamp.toISOString(),
    ...overrides,
  });
}

/**
 * Create comments with chronological timestamps
 * Creates comments with timestamps in ascending order
 */
export function createMockCommentsChronological(count: number): Comment[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (count - index) * 10); // 10 minutes apart
    return createMockCommentWithTimestamp(timestamp);
  });
}

/**
 * Create a comment with markdown content
 */
export function createMockCommentWithMarkdown(overrides?: Partial<Comment>): Comment {
  return createMockComment({
    // eslint-disable-next-line ttrpg-custom/no-tailwind-typography
    content: `# Heading\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2`,
    ...overrides,
  });
}

/**
 * Create a comment with long content
 */
export function createMockLongComment(overrides?: Partial<Comment>): Comment {
  const longContent = Array.from(
    { length: 10 },
    (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  ).join('\n\n');

  return createMockComment({
    content: longContent,
    ...overrides,
  });
}

/**
 * Create a comment with empty content (for validation testing)
 */
export function createMockEmptyComment(overrides?: Partial<Comment>): Comment {
  return createMockComment({
    content: '',
    ...overrides,
  });
}

/**
 * Create a comment with whitespace-only content (for validation testing)
 */
export function createMockWhitespaceComment(overrides?: Partial<Comment>): Comment {
  return createMockComment({
    content: '   \n\t  ',
    ...overrides,
  });
}

/**
 * Create comments for a specific work item
 */
export function createMockCommentsForWorkItem(workItemId: string, count: number): Comment[] {
  return createMockComments(count, { work_item_id: workItemId });
}

/**
 * Create comments by different authors
 */
export function createMockCommentsByDifferentAuthors(count: number): CommentWithAuthor[] {
  return Array.from({ length: count }, (_, index) => {
    const author = createMockUser({ id: `user-${index + 1}` });
    return createMockCommentWithAuthor({
      author_id: author.id,
      author,
    });
  });
}
