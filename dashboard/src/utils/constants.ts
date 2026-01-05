export const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Users', path: '/users', icon: 'Users' },
  { name: 'Workout Plans', path: '/workout-plans', icon: 'Dumbbell' },
  { name: 'Diet Plans', path: '/diet-plans', icon: 'Apple' },
  { name: 'Memberships', path: '/memberships', icon: 'CreditCard' },
  { name: 'Attendance', path: '/attendance', icon: 'Calendar' },
  { name: 'Payments', path: '/payments', icon: 'DollarSign' },
  { name: 'Profile', path: '/profile', icon: 'User' },
] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  USERS: '/users',
  WORKOUT_PLANS: '/workout/plans',
  DIET_PLANS: '/diet/plans',
  MEMBERSHIPS: {
    CREATE: '/membership',
    CURRENT: '/membership/current',
  },
  ATTENDANCE: {
    CHECK_IN: '/attendance/check-in',
  },
  PAYMENTS: '/payment/history',
} as const;

export const MEMBERSHIP_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const WORKOUT_DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;