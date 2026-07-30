import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { TemplateStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { TemplatePreviewComponent } from './template-preview.component';

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

@Component({
  selector: 'lib-template-selector',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    TemplatePreviewComponent
],
  templateUrl: './template-selector.component.html',
  styleUrl: './template-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateSelectorComponent implements OnInit {
  private readonly templateStore = inject(TemplateStore);

  placeholder = input<string>('Choose a template...');
  helpText = input<string>('Templates provide pre-configured settings for common work item types');
  showNoneOption = input<boolean>(true);

  readonly templates = this.templateStore.entities;
  readonly loading = this.templateStore.loading;

  selectedTemplate = signal<WorkItemTemplate | null>(null);

  templateSelected = output<WorkItemTemplate | null>();

  ngOnInit(): void {
    this.templateStore.loadTemplates();
  }

  onTemplateChange(event: { value: WorkItemTemplate | null }): void {
    const template = event.value;
    this.selectedTemplate.set(template);
    this.templateSelected.emit(template);
  }

  clearSelection(): void {
    this.selectedTemplate.set(null);
    this.templateSelected.emit(null);
  }
}
