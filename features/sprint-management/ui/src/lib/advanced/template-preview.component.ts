import { Component, input } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

@Component({
  selector: 'lib-template-preview',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './template-preview.component.html',
  styleUrl: './template-preview.component.scss',
})
export class TemplatePreviewComponent {
  template = input.required<WorkItemTemplate>();
}
