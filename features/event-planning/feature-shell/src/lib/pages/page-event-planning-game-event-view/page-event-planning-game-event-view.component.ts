import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { take } from 'rxjs';

@Component({
  selector: 'lib-page-event-planning-game-event-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-event-planning-game-event-view.component.html',
  styleUrl: './page-event-planning-game-event-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventViewComponent {

  private authService = inject(AuthService)

  public login() {
    this.authService.login('ttrpg_admin', 'ttrpg_pass').pipe(take(1)).subscribe(res => {
      console.log(res)
    })
  }

  public refresh() {
    this.authService.refresh().pipe(take(1)).subscribe(res => {
      console.log(res)
    })
  }

  public getUser() {
    this.authService.getUser().pipe(take(1)).subscribe(res => {
      console.log(res)
    })
  }

  public logout() {
    this.authService.logout().pipe(take(1)).subscribe(res => {
      console.log(res)
    })
  }
}
