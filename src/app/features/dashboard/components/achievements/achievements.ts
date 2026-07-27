import {
  Component,
} from '@angular/core';

type BadgeStatus =
  | 'earned'
  | 'locked';

interface AchievementBadge {
  id: string;
  icon: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  status: BadgeStatus;
  earnedAt: string | null;
}

@Component({
  selector: 'app-achievements',
  imports: [],
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss',
})
export class Achievements {
  readonly employeeName =
    'Syed Aman';

  readonly totalPoints =
    420;

  readonly currentLevel =
    4;

  readonly currentRank =
    3;

  readonly resolvedThisMonth =
    18;

  readonly nextLevelPoints =
    500;

  readonly badges:
    AchievementBadge[] = [
    {
      id:
        'quick-responder',

      icon:
        '⚡',

      name:
        'Quick Responder',

      description:
        'Started 10 assigned tickets within 15 minutes.',

      progress:
        10,

      target:
        10,

      status:
        'earned',

      earnedAt:
        '2026-07-22T10:30:00',
    },
    {
      id:
        'first-time-fix',

      icon:
        '🎯',

      name:
        'First-Time Fix',

      description:
        'Resolved 10 tickets without reopening.',

      progress:
        10,

      target:
        10,

      status:
        'earned',

      earnedAt:
        '2026-07-24T12:10:00',
    },
    {
      id:
        'resolution-streak',

      icon:
        '🔥',

      name:
        'Resolution Streak',

      description:
        'Resolve 5 consecutive tickets.',

      progress:
        4,

      target:
        5,

      status:
        'locked',

      earnedAt:
        null,
    },
    {
      id:
        'great-communicator',

      icon:
        '💬',

      name:
        'Great Communicator',

      description:
        'Add helpful updates to 20 tickets.',

      progress:
        14,

      target:
        20,

      status:
        'locked',

      earnedAt:
        null,
    },
  ];

  get levelProgress(): number {
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
    if (!badge.target) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (
          badge.progress /
          badge.target
        ) *
        100,
      ),
    );
  }
}