import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  get canViewTeamPool(): boolean {
    return this.authService.hasRole(
      'System Admin',
      'Department Manager',
    );
  }

  @Input()
isMobileOpen = false;

@Output()
readonly navigationSelected =
  new EventEmitter<void>();

closeAfterNavigation(): void {
  this.navigationSelected.emit();
}

  get canViewReports(): boolean {
    return this.authService.hasRole(
      'System Admin',
      'Department Manager',
    );
  }

  get canViewMasters(): boolean {
    return this.authService.hasRole('System Admin');
  }
}