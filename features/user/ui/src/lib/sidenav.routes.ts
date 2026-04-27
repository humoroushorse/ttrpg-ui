import { SharedSidenavRouterItem } from '@ttrpg-ui/shared/sidenav/ui';

export const userSidenavRoutes: SharedSidenavRouterItem[] = [
  {
    viewValue: 'User Settings',
    path: ['user', 'settings'],
    requiresLogin: true,
  },
];
