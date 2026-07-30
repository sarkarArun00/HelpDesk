import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  AchievementBadge as ApiAchievementBadge,
  TicketApiService,
} from '../../../tickets/services/ticket-api.service';

type BadgeStatus =
  | 'earned'
  | 'locked';

interface AchievementBadge {
  id: number;
  icon: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  percentage: number;
  status: BadgeStatus;
  earnedAt: string | null;
}

@Component({
  selector: 'app-achievements',
  imports: [FormsModule],
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss',
})
export class Achievements implements OnInit {
  private readonly authService =
    inject(AuthService);

  private readonly ticketApiService =
    inject(TicketApiService);

  employeeName = 'Employee';

  selectedMonth =
    new Date().getMonth() + 1;

  selectedYear =
    new Date().getFullYear();

  assignedTickets = 0;

  resolvedThisMonth = 0;

  badges: AchievementBadge[] = [];

  isLoading = false;

  loadError = '';

  /*
   * These values are not currently returned
   * by /ticket/achievment.
   */
  totalPoints = 0;

  currentLevel = 1;

  currentRank: number | null = null;

  nextLevelPoints = 500;

  readonly monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  ngOnInit(): void {
    this.loadAchievements();
  }

  onMonthChange(): void {
    this.loadAchievements();
  }

  loadAchievements(): void {
    const currentUser =
      this.authService.currentUser();

    if (!currentUser?.id) {
      this.loadError =
        'Unable to identify the logged-in employee.';

      return;
    }

    const user =
      currentUser as unknown as {
        fullName?: string;
      };

    this.employeeName =
      user.fullName ?? 'Employee';

    this.isLoading = true;
    this.loadError = '';

    this.ticketApiService
      .getEmployeeAchievements({
        employee_id: currentUser.id,
        month: Number(this.selectedMonth),
        year: this.selectedYear,
      })
      .subscribe({
        next: response => {
          this.isLoading = false;

          if (!response.success) {
            this.loadError =
              response.message ||
              'Unable to load achievements.';

            return;
          }

          this.assignedTickets =
            response.assignedTickets ?? 0;

          this.badges =
            (response.badges ?? []).map(
              badge =>
                this.mapBadge(badge),
            );

          this.resolvedThisMonth = response.resolvedTickets ?? [],
            
          // this.resolvedThisMonth =
          //   this.getResolvedTicketCount(
          //     response.badges ?? [],
          //   );

          /*
           * Temporary points calculation.
           * Remove this when the backend returns
           * actual points and level values.
           */
          this.totalPoints =
            this.earnedBadgesCount * 100;

          this.currentLevel =
            Math.max(
              1,
              Math.floor(
                this.totalPoints / 500,
              ) + 1,
            );

          this.nextLevelPoints =
            this.currentLevel * 500;
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoading = false;

          this.loadError =
            error.error?.message ||
            'Unable to load achievements.';

          this.assignedTickets = 0;
          this.resolvedThisMonth = 0;
          this.badges = [];
        },
      });
  }

  private mapBadge(
    badge: ApiAchievementBadge,
  ): AchievementBadge {
    return {
      id: badge.id,
      icon: badge.icon,
      name: badge.name,
      description: badge.description,
      progress:
        Number(badge.progress) || 0,
      target:
        Number(badge.target) || 100,
      percentage:
        Number(badge.percentage) || 0,
      status:
        badge.status === 'EARNED'
          ? 'earned'
          : 'locked',
      earnedAt:
        badge.earnedAt,
    };
  }

  private getResolvedTicketCount(
    badges: ApiAchievementBadge[],
  ): number {
    const resolutionBadge =
      badges.find(
        badge =>
          badge.code ===
          'RESOLUTION_STREAK',
      );

    return Number(
      resolutionBadge
        ?.resolvedTickets ?? 0,
    );
  }

  get levelProgress(): number {
    if (!this.nextLevelPoints) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (
          this.totalPoints /
          this.nextLevelPoints
        ) *
        100,
      ),
    );
  }

  get pointsRemaining(): number {
    return Math.max(
      0,
      this.nextLevelPoints -
      this.totalPoints,
    );
  }

  get earnedBadgesCount(): number {
    return this.badges.filter(
      badge =>
        badge.status === 'earned',
    ).length;
  }

  getBadgeProgress(
    badge: AchievementBadge,
  ): number {
    return Math.min(
      100,
      Math.max(
        0,
        Number(badge.percentage) || 0,
      ),
    );
  }
}