import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'lib-shared-notification',
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './shared-notification.component.html',
    styleUrl: './shared-notification.component.scss'
})
export class SharedNotificationComponent {

  title = input<string | undefined>();

  description = input<string | undefined>();

  descriptionHtml = input<string | undefined>();

  descriptionJson = input<object | undefined>()

  icon = input<string | undefined>();

  color = input<'primary' | 'error' | undefined>();

}
