import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { AuthService } from '../../core/auth/services/auth.service';
import {
  NotificationType,
  ServiceDeskNotification,
} from '../../core/notifications/models/notification.model';
import { NotificationService } from '../../core/notifications/services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    DatePipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header
  implements OnInit {
  readonly authService = inject(AuthService);

  readonly notificationService =
    inject(NotificationService);

  readonly notifications =
    this.notificationService
      .currentUserNotifications;

  readonly unreadCount =
    this.notificationService.unreadCount;

  @Output()
  readonly mobileMenuClicked =
    new EventEmitter<void>();
  
  private readonly authApiService =
    inject(AuthApiService);

  isProfileMenuVisible = false;
  isNotificationMenuVisible = false;


  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authApiService
      .getProfile()
      .subscribe({
        next: response => {
          if (
            response.success &&
            response.data
          ) {
            this.authService
              .updateUserProfile(
                response.data,
              );
          }
        },

        error: error => {
          console.error(
            'Unable to load profile:',
            error,
          );
        },
      });
  }

  getProfilePhotoUrl(
    employeePhoto: string | null | undefined,
  ): string | null {
    if (!employeePhoto) {
      return null;
    }

    if (
      employeePhoto.startsWith('http://') ||
      employeePhoto.startsWith('https://')
    ) {
      return employeePhoto;
    }

    const baseUrl =
      environment.apiBaseUrl.replace(
        /\/$/,
        '',
      );

    const photoPath =
      employeePhoto.replace(
        /^\//,
        '',
      );

    return `${baseUrl}/${photoPath}`;
  }
  
  openMobileMenu(): void {
    this.mobileMenuClicked.emit();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuVisible =
      !this.isProfileMenuVisible;

    this.isNotificationMenuVisible = false;
  }

  toggleNotificationMenu(): void {
    this.isNotificationMenuVisible =
      !this.isNotificationMenuVisible;

    this.isProfileMenuVisible = false;
  }

  closeProfileMenu(): void {
    this.isProfileMenuVisible = false;
  }

  closeNotificationMenu(): void {
    this.isNotificationMenuVisible = false;
  }

  closeAllMenus(): void {
    this.closeProfileMenu();
    this.closeNotificationMenu();
  }

  markNotificationAsRead(
    notificationId: string,
  ): void {
    this.notificationService.markAsRead(
      notificationId,
    );
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(
    event: MouseEvent,
    notificationId: string,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    this.notificationService
      .deleteNotification(notificationId);
  }

  openNotification(
    notification: ServiceDeskNotification,
  ): void {
    this.markNotificationAsRead(
      notification.id,
    );

    this.closeNotificationMenu();
  }

  getNotificationIcon(
    type: NotificationType,
  ): string {
    switch (type) {
      case 'ticket-created':
        return 'bi-ticket-detailed';

      case 'ticket-assigned':
        return 'bi-person-check';

      case 'status-changed':
        return 'bi-arrow-repeat';

      case 'comment':
        return 'bi-chat-left-text';

      case 'system':
        return 'bi-info-circle';

      default:
        return 'bi-bell';
    }
  }

  logout(): void {
    this.closeAllMenus();
    this.authService.logout();
  }

  getInitials(fullName: string): string {
    if (!fullName?.trim()) {
      return '--';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map(namePart =>
        namePart.charAt(0).toUpperCase(),
      )
      .join('')
      .slice(0, 2);
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.closeAllMenus();
  }
}