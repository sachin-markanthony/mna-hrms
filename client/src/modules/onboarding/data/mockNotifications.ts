import type { InductionNotification } from '../types/induction.types';

export const MOCK_NOTIFICATIONS: InductionNotification[] = [
  {
    id: 'notif-1',
    title: 'Induction In Progress',
    message: 'You have completed 7 of 22 chapters. Next chapter: Understanding the Brokerage Business.',
    type: 'info',
    timestamp: '15 mins ago',
    read: false,
    actionLabel: 'Resume Session 3',
    actionRoute: '#session-3',
  },
  {
    id: 'notif-2',
    title: 'Pending HR Milestone',
    message: 'Complete Sessions 1 through 7 to unlock your formal Grand Final Quiz.',
    type: 'warning',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Digital Commitment Notice',
    message: 'Employee acknowledgement sign-off required following Chapter 18 completion.',
    type: 'action',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif-4',
    title: 'Orientation Milestone Achieved',
    message: 'Congratulations on finishing Session 2: Understanding Real Estate fundamentals.',
    type: 'success',
    timestamp: '2 days ago',
    read: true,
  },
];
