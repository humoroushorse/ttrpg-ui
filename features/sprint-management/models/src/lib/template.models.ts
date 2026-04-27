import { WorkItemType, WorkItemPriority } from './work-item.models';
import { CustomFieldDefinition } from './custom-field.models';

export interface WorkItemTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkItemType;
  defaultPriority?: WorkItemPriority;
  defaultTags?: string[];
  customFields?: CustomFieldDefinition[];
  descriptionTemplate?: string;
}

export enum TemplateCategory {
  Bug = 'Bug',
  Feature = 'Feature',
  Task = 'Task',
  Epic = 'Epic',
  Custom = 'Custom',
}
