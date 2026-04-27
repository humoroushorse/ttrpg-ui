import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

@Component({
  selector: 'lib-template-preview',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './template-preview.component.html',
  styleUrl: './template-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatePreviewComponent {
  template = input.required<WorkItemTemplate>();
}
