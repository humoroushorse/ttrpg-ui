import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-page-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a mat-raised-button color="primary" [routerLink]="['/sprint-management']"> Go to Work Items </a>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
      }

      .not-found-content {
        text-align: center;
        max-width: 500px;
      }

      .not-found-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: var(--mat-sys-error);
        margin-bottom: 1rem;
      }

      h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.125rem;
        margin-bottom: 2rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class PageNotFoundComponent {}
