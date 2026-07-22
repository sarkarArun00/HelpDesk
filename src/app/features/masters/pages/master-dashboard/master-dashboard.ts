import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { RecordCount } from '../../models/configuration-count-api.model';
import { TicketCategoryApiService } from '../../services/ticket-category-api.service.js';

interface MasterModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  totalRecords: number;
  activeRecords: number;
  inactiveRecords: number;
}

@Component({
  selector: 'app-master-dashboard',
  imports: [RouterLink],
  templateUrl: './master-dashboard.html',
  styleUrl: './master-dashboard.scss',
})
export class MasterDashboard
  implements OnInit {
  private readonly ticketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoadingCounts = false;

  countError = '';

  masterModules: MasterModule[] = [
    // {
    //   id: 'departments',
    //   title: 'Department / Team Master',
    //   description:
    //     'Manage organizational departments, supervisors and department availability.',
    //   icon: 'bi-diagram-3',
    //   totalRecords: 0,
    //   activeRecords: 0,
    //   inactiveRecords: 0,
    // },
    {
      id: 'users',
      title: 'Employee Master',
      description:
        'Manage employees and configure their system roles.',
      icon: 'bi-people',
      totalRecords: 0,
      activeRecords: 0,
      inactiveRecords: 0,
    },
    // {
    //   id: 'priorities',
    //   title: 'Priority Master',
    //   description:
    //     'View the Critical, High, Medium and Low ticket priorities.',
    //   icon: 'bi-flag',
    //   totalRecords: 0,
    //   activeRecords: 0,
    //   inactiveRecords: 0,
    // },
    {
      id: 'categories',
      title: 'Ticket Category Master',
      description:
        'Configure issue categories and map them to their target departments.',
      icon: 'bi-tags',
      totalRecords: 0,
      activeRecords: 0,
      inactiveRecords: 0,
    },
    {
      id: 'centres',
      title: 'Centre / Facility Master',
      description:
        'View laboratories, collection points and office locations.',
      icon: 'bi-building',
      totalRecords: 0,
      activeRecords: 0,
      inactiveRecords: 0,
    },
  ];

  get totalRecords(): number {
    return this.masterModules.reduce(
      (total, master) =>
        total + master.totalRecords,
      0,
    );
  }

  get activeRecords(): number {
    return this.masterModules.reduce(
      (total, master) =>
        total + master.activeRecords,
      0,
    );
  }

  get inactiveRecords(): number {
    return this.masterModules.reduce(
      (total, master) =>
        total + master.inactiveRecords,
      0,
    );
  }

  ngOnInit(): void {
    this.loadRecordCounts();
  }

  loadRecordCounts(): void {
    this.isLoadingCounts = true;
    this.countError = '';

    this.ticketCategoryApiService
      .getRecordCounts()
      .subscribe({
        next: response => {
          this.isLoadingCounts = false;

          if (!response.success) {
            this.countError =
              response.message ||
              'Unable to load record counts.';

            return;
          }

          const countByModuleId:
            Partial<
              Record<string, RecordCount>
            > = {
            categories:
              response.data
                .ticketCategoryCount,

            centres:
              response.data
                .centreCount,
          };

          this.masterModules =
            this.masterModules.map(
              module => {
                const apiCount =
                  countByModuleId[
                  module.id
                  ];

                if (!apiCount) {
                  return module;
                }

                return {
                  ...module,
                  totalRecords:
                    apiCount.totalRecords,
                  activeRecords:
                    apiCount.activeRecords,
                  inactiveRecords:
                    apiCount.inactiveRecords,
                };
              },
            );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoadingCounts = false;

          this.countError =
            error.error?.message ||
            'Unable to load record counts.';
        },
      });
  }
}