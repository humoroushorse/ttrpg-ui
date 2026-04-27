import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-sprint-management-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="sprint-management-shell">
      <router-outlet />
    </div>
  `,
  styles: [`
    .sprint-management-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintManagementShellComponent {}
