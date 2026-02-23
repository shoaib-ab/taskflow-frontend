import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: '/dashboard',
    icon: 'dashboard',
    label: 'All Tasks',
    roles: ['employee', 'manager', 'admin'],
    // Also active on task-related sub-pages
    match: (path) =>
      path === '/dashboard' ||
      path === '/create-task' ||
      path.startsWith('/edit-task') ||
      path.startsWith('/task/'),
  },
  {
    to: '/manager-dashboard',
    icon: 'analytics',
    label: 'Manager Dashboard',
    roles: ['manager', 'admin'],
  },
  {
    to: '/analytics',
    icon: 'monitoring',
    label: 'Analytics',
    roles: ['manager', 'admin'],
  },
  {
    to: '/team-tasks',
    icon: 'assignment',
    label: 'Team Tasks',
    roles: ['manager', 'admin'],
  },
  {
    to: '/teams',
    icon: 'groups',
    label: 'Teams',
    roles: ['manager', 'admin'],
  },
  {
    to: '/admin/users',
    icon: 'manage_accounts',
    label: 'User Management',
    roles: ['admin'],
  },
  {
    to: '/profile',
    icon: 'person',
    label: 'Profile & Settings',
    roles: ['employee', 'manager', 'admin'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const {
    user: { role },
    logout,
  } = useAuth();

  const { pathname } = useLocation();

  const isActive = (item) =>
    item.match ? item.match(pathname) : pathname === item.to;

  return (
    <aside className='w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex flex-col shrink-0'>
      {/* Logo */}
      <div className='p-6 flex items-center gap-3'>
        <div className='bg-primary p-1.5 rounded-lg flex items-center justify-center'>
          <span className='material-symbols-outlined text-white text-2xl'>
            layers
          </span>
        </div>
        <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
          TaskMaster
        </h1>
      </div>

      {/* Nav links */}
      <nav className='flex-1 px-4 space-y-1 mt-4'>
        {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              isActive(item)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className='material-symbols-outlined'>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={logout}
          className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
        >
          <span className='material-symbols-outlined'>logout</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* Pro Plan footer */}
      <div className='p-4 border-t border-slate-200 dark:border-slate-800'>
        <div className='bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10'>
          <p className='text-xs font-bold text-primary mb-1 uppercase'>
            Pro Plan
          </p>
          <p className='text-sm text-slate-600 dark:text-slate-300 mb-3'>
            Upgrade for unlimited team members.
          </p>
          <button className='w-full py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors'>
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
