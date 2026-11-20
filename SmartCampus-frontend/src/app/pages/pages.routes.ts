import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { DashboardComponent } from './ui-components/dashboard/dashboard.component';
import { AnouncesComponent } from './ui-components/anounces/anounces.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Dashboard',
      urls: [
        { title: 'Dashboard', url: 'dashboards/dashboard' },
        { title: 'Starter Page' },
      ],
    },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      title: 'Dashboard',
      urls: [
        { title: 'Dashboard', url: 'dashboard' },
      ],
    },
  },
  {
    path: 'anounces',
    component: AnouncesComponent,
    data: {
      title: 'Annonces',
      urls: [
        { title: 'Dashboard', url: 'dashboards/dashboard' },
        { title: 'Annonces', url: '/pages/ui-components/anounces' },
      ],
    },
  },
];
