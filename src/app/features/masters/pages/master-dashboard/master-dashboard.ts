import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
export class MasterDashboard {
  readonly masterModules: MasterModule[] = [
    {
      id: 'departments',
      title: 'Department / Team Master',
      description:
        'Manage organizational departments, supervisors and department availability.',
      icon: 'bi-diagram-3',
      totalRecords: 12,
      activeRecords: 10,
      inactiveRecords: 2,
    },
    {
      id: 'users',
      title: 'User & Department Mapping',
      description:
        'Map employees to departments and configure their system roles.',
      icon: 'bi-people',
      totalRecords: 85,
      activeRecords: 80,
      inactiveRecords: 5,
    },
    {
      id: 'priorities',
      title: 'Priority Master',
      description:
        'Configure the Critical, High, Medium and Low ticket priorities.',
      icon: 'bi-flag',
      totalRecords: 4,
      activeRecords: 4,
      inactiveRecords: 0,
    },
    {
      id: 'categories',
      title: 'Ticket Category Master',
      description:
        'Configure issue categories and map them to their target departments.',
      icon: 'bi-tags',
      totalRecords: 24,
      activeRecords: 21,
      inactiveRecords: 3,
    },
    {
      id: 'centres',
      title: 'Centre / Facility Master',
      description:
        'Manage laboratories, collection points and office locations.',
      icon: 'bi-building',
      totalRecords: 18,
      activeRecords: 17,
      inactiveRecords: 1,
    },
  ];

  get totalRecords(): number {
    return this.masterModules.reduce(
      (total, master) => total + master.totalRecords,
      0,
    );
  }

  get activeRecords(): number {
    return this.masterModules.reduce(
      (total, master) => total + master.activeRecords,
      0,
    );
  }

  get inactiveRecords(): number {
    return this.masterModules.reduce(
      (total, master) => total + master.inactiveRecords,
      0,
    );
  }
}