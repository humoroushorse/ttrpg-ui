import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { AuditAction } = SprintModels.AuditLog;
type AuditLog = SprintModels.AuditLog.AuditLog;
type AuditAction = SprintModels.AuditLog.AuditAction;
type AuditLogFilter = SprintModels.AuditLog.AuditLogFilter;

@Component({
  selector: 'lib-audit-log-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogListComponent {
  logs = input.required<AuditLog[]>();
  loading = input<boolean>(false);
  showFilters = input<boolean>(true);
  filterChange = output<AuditLogFilter>();

  filterForm = new FormGroup({
    user_id: new FormControl<string | null>(null),
    action: new FormControl<AuditAction | null>(null),
    start_date: new FormControl<Date | null>(null),
    end_date: new FormControl<Date | null>(null),
  });

  auditActions = Object.values(AuditAction);

  sortedLogs = computed(() => {
    const logs = this.logs();
    return [...logs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  });

  uniqueUsers = computed(() => {
    const logs = this.logs();
    const userIds = new Set(logs.map((log) => log.user_id));
    return Array.from(userIds).sort();
  });

  applyFilters(): void {
    const formValue = this.filterForm.value;
    const filter: AuditLogFilter = {};

    if (formValue.user_id) {
      filter.user_id = formValue.user_id;
    }

    if (formValue.action) {
      filter.action = formValue.action;
    }

    if (formValue.start_date) {
      filter.start_date = formValue.start_date.toISOString();
    }

    if (formValue.end_date) {
      filter.end_date = formValue.end_date.toISOString();
    }

    this.filterChange.emit(filter);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterChange.emit({});
  }

  getActionIcon(action: AuditAction): string {
    switch (action) {
      case AuditAction.Created:
        return 'add_circle';
      case AuditAction.Updated:
        return 'edit';
      case AuditAction.Deleted:
        return 'delete';
      case AuditAction.StatusChanged:
        return 'swap_horiz';
      case AuditAction.Assigned:
        return 'person_add';
      case AuditAction.Unassigned:
        return 'person_remove';
      case AuditAction.CommentAdded:
        return 'comment';
      case AuditAction.DependencyAdded:
        return 'link';
      case AuditAction.DependencyRemoved:
        return 'link_off';
      default:
        return 'info';
    }
  }

  getActionColor(action: AuditAction): string {
    switch (action) {
      case AuditAction.Created:
        return 'primary';
      case AuditAction.Updated:
        return 'accent';
      case AuditAction.Deleted:
        return 'warn';
      case AuditAction.StatusChanged:
        return 'primary';
      case AuditAction.Assigned:
      case AuditAction.Unassigned:
        return 'accent';
      case AuditAction.CommentAdded:
      case AuditAction.DependencyAdded:
      case AuditAction.DependencyRemoved:
        return '';
      default:
        return '';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }

  getUserName(log: AuditLog): string {
    return log.user_name || `User ${log.user_id}`;
  }

  formatAction(action: AuditAction): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  hasChanges(log: AuditLog): boolean {
    return log.changes && Object.keys(log.changes).length > 0;
  }

  isStatusChange(log: AuditLog): boolean {
    return log.action === AuditAction.StatusChanged;
  }

  getChangesEntries(
    log: AuditLog,
  ): Array<{ key: string; oldValue: string | null; newValue: string; isSimple: boolean }> {
    if (!log.changes) {
      return [];
    }
    return Object.entries(log.changes).map(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      if (value !== null && typeof value === 'object' && 'old' in value && 'new' in value) {
        return {
          key: label,
          oldValue: this.formatChangeValue((value as { old: unknown; new: unknown }).old),
          newValue: this.formatChangeValue((value as { old: unknown; new: unknown }).new),
          isSimple: false,
        };
      }
      return {
        key: label,
        oldValue: null,
        newValue: this.formatChangeValue(value),
        isSimple: true,
      };
    });
  }

  private formatChangeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'None';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}
