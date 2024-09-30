import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-features-event-planning-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule],
  templateUrl: './features-event-planning-feature-shell.component.html',
  styleUrl: './features-event-planning-feature-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesEventPlanningFeatureShellComponent {
  private sharedCoreService = inject(SharedCoreService);

  public sidenavOpened$ = this.sharedCoreService.getSidenavOpened();

  public toolbarHeight$$ = this.sharedCoreService.getToolbarHeight();

  public sidnavHeight$$ = computed<string>(() => {
    return `calc(100dvh - ${this.toolbarHeight$$()}px)`;
  });

  public routes = [
    { viewValue: 'Game Session', path: ['game-event'] },
    {
      viewValue: 'Game Session: but the title is really long to test text wrapping and the such',
      path: ['game-event'],
    },
    { viewValue: 'foobar', path: ['foobar'] },
    { viewValue: 'foobar1', path: ['foobar'] },
    { viewValue: 'foobar2', path: ['foobar'] },
    { viewValue: 'foobar3', path: ['foobar'] },
    { viewValue: 'foobar4', path: ['foobar'] },
    { viewValue: 'foobar5', path: ['foobar'] },
    { viewValue: 'foobar6', path: ['foobar'] },
    { viewValue: 'foobar7', path: ['foobar'] },
    { viewValue: 'foobar8', path: ['foobar'] },
    { viewValue: 'foobar9', path: ['foobar'] },
    { viewValue: 'foobar10', path: ['foobar'] },
    { viewValue: 'foobar11', path: ['foobar'] },
    { viewValue: 'foobar12', path: ['foobar'] },
    { viewValue: 'foobar13', path: ['foobar'] },
    { viewValue: 'foobar14', path: ['foobar'] },
    { viewValue: 'foobar15', path: ['foobar'] },
    { viewValue: 'foobar16', path: ['foobar'] },
    { viewValue: 'foobar17', path: ['foobar'] },
    { viewValue: 'foobar18', path: ['foobar'] },
    { viewValue: 'foobar19', path: ['foobar'] },
    { viewValue: 'foobar20', path: ['foobar'] },
  ];
}
