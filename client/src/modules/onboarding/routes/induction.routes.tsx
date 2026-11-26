import type { RouteObject } from 'react-router-dom';
import { InductionDashboard } from '../pages/InductionDashboard';

export const inductionRoutes: RouteObject[] = [
  {
    path: '/induction',
    element: <InductionDashboard />,
  },
];
