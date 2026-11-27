import { InductionApp } from '../InductionApp';

/**
 * The onboarding module owns the full `/induction/*` route tree.
 * `App.tsx` mounts this route without the global AppLayout so the induction
 * experience can use its own learning-focused sidebar and top bar.
 */
export const inductionRoutes = [
  {
    path: '/induction/*',
    element: <InductionApp />,
  },
];
