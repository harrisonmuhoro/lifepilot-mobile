export const ApiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  sync: {
    pull: '/sync/pull',
    push: '/sync/push',
    status: '/sync/status',
  },
  finance: {
    transactions: '/finance/transactions',
    budgets: '/finance/budgets',
    accounts: '/finance/accounts',
    summary: '/finance/summary',
  },
  planner: {
    tasks: '/planner/tasks',
    habits: '/planner/habits',
    goals: '/planner/goals',
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    weeklyReview: '/analytics/weekly-review',
  },
} as const;
