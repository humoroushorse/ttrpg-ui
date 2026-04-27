import { SharedSidenavRouterItem } from '@ttrpg-ui/shared/sidenav/ui';

export const featuresSprintManagementFeatureShellSidenavRoutes: SharedSidenavRouterItem[] = [
  {
    viewValue: 'Board',
    path: ['board'],
    icon: 'dashboard',
  },
  {
    viewValue: 'Work Items',
    path: ['work-items'],
    icon: 'assignment',
  },
  {
    viewValue: 'Sprints',
    path: ['sprints'],
    icon: 'event',
  },
  {
    viewValue: 'Projects',
    path: ['projects'],
    icon: 'folder',
  },
];
