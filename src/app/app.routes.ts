import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
    {
    path: 'login',
    title: 'Sign In | ISD Ticketing System',
    loadComponent: () =>
      import(
        './features/auth/pages/login/login'
      ).then(component => component.Login),
  },
  {
    path: 'forgot-password',
    title:
      'Forgot Password | ISD Ticketing System',
    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password/forgot-password'
      ).then(
        component =>
          component.ForgotPassword,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './layouts/main-layout/main-layout'
      ).then(component => component.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard | ISD Ticketing System',
        loadComponent: () =>
          import(
            './features/dashboard/pages/dashboard/dashboard'
          ).then(component => component.Dashboard),
      },
      {
        path: 'tickets/raise',
        title: 'Raise Ticket | ISD Ticketing System',
        loadComponent: () =>
          import(
            './features/tickets/pages/raise-ticket/raise-ticket'
          ).then(component => component.RaiseTicket),
      },
      {
        path: 'tickets/my-raised',
        title: 'My Raised Tickets | ISD Ticketing System',
        loadComponent: () =>
          import(
            './features/tickets/pages/my-raised-tickets/my-raised-tickets'
          ).then(component => component.MyRaisedTickets),
      },
      {
        path: 'tickets/action-items',
        title: 'My Action Items | ISD Ticketing System',
        loadComponent: () =>
            import(
            './features/tickets/pages/my-action-items/my-action-items'
            ).then(component => component.MyActionItems),
        },
        {
          path: 'tickets/team-pool',
          title: 'Team Pool | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: [
              'System Admin',
              'Department Manager',
            ],
          },
          loadComponent: () =>
            import(
              './features/tickets/pages/team-pool/team-pool'
            ).then(component => component.TeamPool),
        },
        {
        path: 'tickets/:ticketId',
        title: 'Ticket Details | ISD Ticketing System',
        loadComponent: () =>
            import(
            './features/tickets/pages/ticket-details/ticket-details'
            ).then(component => component.TicketDetails),
        },
        {
          path: 'masters',
          title: 'Configuration Masters | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: ['System Admin'],
          },
          loadComponent: () =>
            import(
              './features/masters/pages/master-dashboard/master-dashboard'
            ).then(component => component.MasterDashboard),
        },
          {
            path: 'masters/departments',
            title: 'Department Master | ISD Ticketing System',
            canActivate: [roleGuard],
            data: {
              roles: ['System Admin'],
            },
            loadComponent: () =>
              import(
                './features/masters/pages/department-master/department-master'
              ).then(component => component.DepartmentMaster),
          },
          {
            path: 'masters/users',
            title: 'User Mapping Master | ISD Ticketing System',
            canActivate: [roleGuard],
            data: {
              roles: ['System Admin'],
            },
            loadComponent: () =>
              import(
                './features/masters/pages/user-mapping-master/user-mapping-master'
              ).then(component => component.UserMappingMaster),
          },
        {
          path: 'masters/priorities',
          title: 'Priority Master | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: ['System Admin'],
          },
          loadComponent: () =>
            import(
              './features/masters/pages/priority-master/priority-master'
            ).then(component => component.PriorityMaster),
        },
        {
          path: 'masters/categories',
          title: 'Ticket Category Master | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: ['System Admin'],
          },
          loadComponent: () =>
            import(
              './features/masters/pages/ticket-category-master/ticket-category-master'
            ).then(component => component.TicketCategoryMaster),
        },
        {
          path: 'masters/centres',
          title: 'Centre Master | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: ['System Admin'],
          },
          loadComponent: () =>
            import(
            './features/masters/pages/centre-master/centre-master'
            ).then(component => component.CentreMaster),
        },
        {
          path: 'reports',
          title: 'Ticket Reports | ISD Ticketing System',
          canActivate: [roleGuard],
          data: {
            roles: [
              'System Admin',
              'Department Manager',
            ],
          },
          loadComponent: () =>
            import(
              './features/reports/pages/ticket-reports/ticket-reports'
            ).then(component => component.TicketReports),
        },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];