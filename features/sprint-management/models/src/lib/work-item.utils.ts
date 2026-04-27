/**
 * Work Item Utilities
 * Helper functions for work items
 */

import { WorkItem } from './work-item.models';

/**
 * Format ticket number with project key
 * @param workItem Work item with project_id and ticket_number
 * @param projectKey Project key (e.g., 'DND', 'SPRINT')
 * @returns Formatted ticket number (e.g., 'DND-123') or null
 */
export function formatTicketNumber(workItem: Pick<WorkItem, 'ticket_number'>, projectKey?: string): string | null {
  if (!workItem.ticket_number) {
    return null;
  }

  if (!projectKey) {
    return `#${workItem.ticket_number}`;
  }

  return `${projectKey}-${workItem.ticket_number}`;
}

/**
 * Get display title with ticket number
 * @param workItem Work item
 * @param projectKey Project key
 * @returns Title with ticket number prefix (e.g., '[DND-123] My Work Item')
 */
export function getDisplayTitle(workItem: Pick<WorkItem, 'title' | 'ticket_number'>, projectKey?: string): string {
  const ticketNum = formatTicketNumber(workItem, projectKey);
  return ticketNum ? `[${ticketNum}] ${workItem.title}` : workItem.title;
}
