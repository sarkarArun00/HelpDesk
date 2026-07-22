import {
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';


interface DashboardStat {
  label: string;
  value: number;
  description: string;
  icon: string;
  type: 'total' | 'assigned' | 'progress' | 'resolved';
}

interface QueueSummary {
  label: string;
  value: number;
  description: string;
}

interface RecentTicket {
  ticketId: string;
  category: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';
  assignee: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly statistics: DashboardStat[] = [
    {
      label: 'Total Tickets',
      value: 128,
      description: 'All tickets visible to you',
      icon: '▦',
      type: 'total',
    },
    {
      label: 'Assigned',
      value: 24,
      description: 'Waiting to be processed',
      icon: '✓',
      type: 'assigned',
    },
    {
      label: 'In Progress',
      value: 18,
      description: 'Currently being handled',
      icon: '↻',
      type: 'progress',
    },
    {
      label: 'Resolved',
      value: 63,
      description: 'Resolution has been submitted',
      icon: '✓',
      type: 'resolved',
    },
  ];

  readonly queueSummaries: QueueSummary[] = [
    {
      label: 'My Action Items',
      value: 12,
      description: 'Tickets currently assigned to you',
    },
    // {
    //   label: 'Unassigned Team Pool',
    //   value: 8,
    //   description: 'Tickets waiting for team assignment',
    // },
    {
      label: 'Awaiting Confirmation',
      value: 5,
      description: 'Resolved tickets awaiting creator confirmation',
    },
  ];

  readonly recentTickets: RecentTicket[] = [
    {
      ticketId: 'ISD-2026-0128',
      category: 'Sample Collection Delay',
      department: 'Logistics',
      priority: 'Critical',
      status: 'In Progress',
      assignee: 'Rahul Sharma',
    },
    {
      ticketId: 'ISD-2026-0127',
      category: 'Invoice Discrepancy',
      department: 'Accounts',
      priority: 'High',
      status: 'Assigned',
      assignee: 'Priya Sen',
    },
    {
      ticketId: 'ISD-2026-0126',
      category: 'Report Correction',
      department: 'Technical',
      priority: 'Medium',
      status: 'Resolved',
      assignee: 'Amit Das',
    },
    {
      ticketId: 'ISD-2026-0125',
      category: 'Reagent Requirement',
      department: 'Laboratory',
      priority: 'Low',
      status: 'Closed',
      assignee: 'Sneha Roy',
    },
  ];

  private readonly activatedRoute =
  inject(ActivatedRoute);

private readonly router = inject(Router);

private readonly destroyRef =
  inject(DestroyRef);

accessDenied = false;

constructor() {
  this.activatedRoute.queryParamMap
    .pipe(
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(queryParams => {
      this.accessDenied =
        queryParams.get('accessDenied') === 'true';
    });
}

dismissAccessDenied(): void {
  this.accessDenied = false;

  void this.router.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      accessDenied: null,
    },
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}

  getPriorityClass(priority: RecentTicket['priority']): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: RecentTicket['status']): string {
    return `status-${status.toLowerCase().replaceAll(' ', '-')}`;
  }
}