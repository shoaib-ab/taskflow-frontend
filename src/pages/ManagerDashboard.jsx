import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

// ─── helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isOverdue = (dueDate, status) =>
  dueDate && status !== 'DONE' && new Date(dueDate) < new Date();

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING: {
    label: 'To Do',
    cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  DONE: {
    label: 'Completed',
    cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
};

const PRIORITY_MAP = {
  high: { label: 'High', dot: 'bg-rose-500', text: 'text-rose-500' },
  medium: { label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-500' },
  low: { label: 'Low', dot: 'bg-slate-500', text: 'text-slate-500' },
};

const PAGE_LIMIT = 10;

// ─── Main Component ───────────────────────────────────────────────────────────
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const {
    user: { name, email, role },
    logout,
  } = useAuth();

  // Stats state (computed from all tasks, fetched once)
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    overdue: 0,
    velocity: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Table state (paginated from server)
  const [tasks, setTasks] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'DONE'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [error, setError] = useState('');

  // ── debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch stats (runs once) ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/tasks/all', {
        params: { limit: 9999, page: 1 },
      });
      const all = data.tasks ?? [];
      const completed = all.filter((t) => t.status === 'DONE').length;
      const active = all.filter((t) => t.status !== 'DONE').length;
      const overdue = all.filter((t) => isOverdue(t.dueDate, t.status)).length;
      const velocity =
        all.length > 0 ? Math.round((completed / all.length) * 100) : 0;
      setStats({ active, completed, overdue, velocity });
    } catch {
      // stats silently fail — table error is more visible
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── fetch paginated table tasks ──
  const fetchTasks = useCallback(async () => {
    setTableLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeTab !== 'ALL') params.status = activeTab;
      const { data } = await api.get('/tasks/all', { params });
      setTasks(data.tasks ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalTasks(data.totalTasks ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setTableLoading(false);
    }
  }, [page, debouncedSearch, activeTab]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page when tab/search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  // ─── Stat cards config ────────────────────────────────────────────────────
  const statCards = [
    {
      icon: 'assignment',
      iconCls: 'bg-blue-500/10 text-blue-500',
      label: 'Active Tasks',
      value: statsLoading ? '…' : stats.active,
      sub: 'Pending + in progress',
      badge: null,
      badgeCls: '',
    },
    {
      icon: 'check_circle',
      iconCls: 'bg-emerald-500/10 text-emerald-500',
      label: 'Completed',
      value: statsLoading ? '…' : stats.completed,
      sub: 'All time',
      badge: null,
      badgeCls: '',
    },
    {
      icon: 'history',
      iconCls: 'bg-amber-500/10 text-amber-500',
      label: 'Overdue',
      value: statsLoading ? '…' : stats.overdue,
      sub: 'Requires attention',
      badge: stats.overdue > 0 ? 'alert' : null,
      badgeCls: 'text-rose-500 bg-rose-500/10',
    },
    {
      icon: 'group',
      iconCls: 'bg-purple-500/10 text-purple-500',
      label: 'Team Velocity',
      value: statsLoading ? '…' : `${stats.velocity}%`,
      sub: 'Avg completion rate',
      badge: null,
      badgeCls: '',
    },
  ];

  return (
    <div className='flex h-screen overflow-hidden bg-background-light dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* ── Sidebar ── */}
      <aside className='w-64 flex-shrink-0 bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-[#30363d] flex flex-col'>
        <div className='p-6 flex items-center gap-3'>
          <div className='size-8 bg-primary rounded flex items-center justify-center text-white'>
            <span className='material-symbols-outlined text-lg'>bolt</span>
          </div>
          <h1 className='text-xl font-bold tracking-tight'>TaskMaster</h1>
        </div>

        <nav className='flex-1 px-4 space-y-1 overflow-y-auto'>
          <p className='px-2 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
            General
          </p>

          <Link
            to='/dashboard'
            className='flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-xl'>dashboard</span>
            <span className='text-sm font-medium'>My Tasks</span>
          </Link>

          {/* Active: Manager Dashboard */}
          <a className='flex items-center gap-3 px-3 py-2.5 text-primary bg-primary/10 rounded-lg transition-colors'>
            <span className='material-symbols-outlined text-xl'>analytics</span>
            <span className='text-sm font-semibold'>Manager Dashboard</span>
          </a>

          <Link
            to='/team-tasks'
            className='flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-xl'>
              assignment
            </span>
            <span className='text-sm font-medium'>Team Tasks</span>
          </Link>

          <p className='px-2 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
            Management
          </p>

          <Link
            to='/teams'
            className='flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-xl'>group</span>
            <span className='text-sm font-medium'>Teams</span>
          </Link>

          <Link
            to='/analytics'
            className='flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-xl'>
              monitoring
            </span>
            <span className='text-sm font-medium'>Analytics</span>
          </Link>

          {role === 'admin' && (
            <Link
              to='/admin/users'
              className='flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'
            >
              <span className='material-symbols-outlined text-xl'>
                manage_accounts
              </span>
              <span className='text-sm font-medium'>User Management</span>
            </Link>
          )}
        </nav>

        {/* User card */}
        <div className='p-4 border-t border-slate-200 dark:border-[#30363d] mt-auto'>
          <div className='flex items-center gap-3 p-2 bg-slate-100 dark:bg-white/5 rounded-xl'>
            <div className='size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0'>
              {getInitials(name)}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-bold truncate'>{name}</p>
              <p className='text-xs text-slate-500 truncate capitalize'>
                {role}
              </p>
            </div>
            <Link
              to='/profile'
              className='text-slate-500 hover:text-primary transition-colors'
              title='Profile &amp; Settings'
            >
              <span className='material-symbols-outlined text-lg'>
                manage_accounts
              </span>
            </Link>
            <button
              onClick={logout}
              className='text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors'
              title='Logout'
            >
              <span className='material-symbols-outlined text-lg'>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className='flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0f1115]'>
        {/* Header */}
        <header className='h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0f1115]/80 backdrop-blur-md shrink-0'>
          <div className='relative w-96'>
            <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg'>
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full h-10 pl-10 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none'
              placeholder='Search tasks…'
            />
          </div>
          <div className='flex items-center gap-4'>
            <button className='size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'>
              <span className='material-symbols-outlined text-slate-500 dark:text-slate-400'>
                notifications
              </span>
            </button>
            <button
              onClick={() => navigate('/create-task')}
              className='flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all'
            >
              <span className='material-symbols-outlined text-sm'>add</span>
              Create Task
            </button>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto p-8 space-y-8'>
          {/* Page heading */}
          <div>
            <h2 className='text-2xl font-black tracking-tight'>
              Manager Dashboard
            </h2>
            <p className='text-slate-500 dark:text-slate-400 text-sm mt-1'>
              Monitor project health and team productivity in real-time.
            </p>
          </div>

          {/* ── Stats cards ── */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {statCards.map((card) => (
              <div
                key={card.label}
                className='bg-white dark:bg-[#161b22] p-6 rounded-xl border border-slate-200 dark:border-[#30363d]'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center ${card.iconCls}`}
                  >
                    <span className='material-symbols-outlined'>
                      {card.icon}
                    </span>
                  </div>
                  {card.value !== '…' && card.label === 'Overdue' ? (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        stats.overdue > 0
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-emerald-500 bg-emerald-500/10'
                      }`}
                    >
                      {stats.overdue > 0 ? 'Action needed' : 'All clear'}
                    </span>
                  ) : card.label === 'Team Velocity' ? (
                    <span className='text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded'>
                      {statsLoading
                        ? '…'
                        : stats.velocity >= 70
                          ? 'On track'
                          : 'Needs review'}
                    </span>
                  ) : null}
                </div>
                <p className='text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider'>
                  {card.label}
                </p>
                <h3 className='text-2xl font-bold mt-1'>{card.value}</h3>
                <p className='text-[10px] text-slate-400 dark:text-slate-600 mt-2'>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Tasks table ── */}
          <div className='bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden'>
            {/* Table header / tabs */}
            <div className='p-6 border-b border-slate-200 dark:border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <h3 className='text-lg font-bold'>Project Tasks</h3>
                <div className='flex bg-slate-100 dark:bg-[#0f1115] p-1 rounded-lg border border-slate-200 dark:border-[#30363d]'>
                  {['ALL', 'IN_PROGRESS', 'DONE'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab === 'ALL'
                        ? 'All'
                        : tab === 'IN_PROGRESS'
                          ? 'Active'
                          : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>
              <p className='text-sm text-slate-500'>
                {totalTasks} task{totalTasks !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className='px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm font-medium'>
                {error}
              </div>
            )}

            {/* Table */}
            <div className='overflow-x-auto'>
              {tableLoading ? (
                <div className='flex items-center justify-center py-24'>
                  <div className='w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin' />
                </div>
              ) : tasks.length === 0 ? (
                <div className='text-center py-24 text-slate-400'>
                  <span className='material-symbols-outlined text-5xl block mb-3'>
                    assignment
                  </span>
                  <p className='font-semibold'>
                    {debouncedSearch || activeTab !== 'ALL'
                      ? 'No tasks match your filters.'
                      : 'No tasks yet.'}
                  </p>
                  {!debouncedSearch && activeTab === 'ALL' && (
                    <button
                      onClick={() => navigate('/create-task')}
                      className='mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors'
                    >
                      Create a task
                    </button>
                  )}
                </div>
              ) : (
                <table className='w-full text-left'>
                  <thead>
                    <tr className='bg-slate-50 dark:bg-[#0f1115]/50 border-b border-slate-200 dark:border-[#30363d]'>
                      {[
                        'Task Title',
                        'Assigned To',
                        'Status',
                        'Priority',
                        'Due Date',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 dark:divide-[#30363d]'>
                    {tasks.map((task) => {
                      const status =
                        STATUS_MAP[task.status] ?? STATUS_MAP.PENDING;
                      const priority =
                        PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
                      const assignedName =
                        typeof task.assignedTo === 'object'
                          ? (task.assignedTo?.name ?? 'Unassigned')
                          : 'Unassigned';
                      const due = task.dueDate;
                      const overdue = isOverdue(due, task.status);

                      return (
                        <tr
                          key={task._id}
                          className='hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group'
                        >
                          {/* Title */}
                          <td className='px-6 py-4'>
                            <div className='flex flex-col'>
                              <span className='text-sm font-semibold'>
                                {task.title}
                              </span>
                              {task.description && (
                                <span className='text-xs text-slate-500 mt-0.5 truncate max-w-[220px]'>
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Assigned To */}
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2'>
                              <div className='size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0'>
                                {getInitials(assignedName)}
                              </div>
                              <span className='text-xs font-medium'>
                                {assignedName}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className='px-6 py-4'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className='px-6 py-4'>
                            <span
                              className={`flex items-center gap-1.5 text-xs font-bold ${priority.text}`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${priority.dot}`}
                              />
                              {priority.label}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className='px-6 py-4'>
                            <span
                              className={`text-xs ${overdue ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                              {overdue && '⚠ '}
                              {fmtDate(due)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className='px-6 py-4 text-right'>
                            <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <Link
                                to={`/task/${task._id}`}
                                className='size-8 flex items-center justify-center rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors'
                                title='View details'
                              >
                                <span className='material-symbols-outlined text-lg'>
                                  open_in_new
                                </span>
                              </Link>
                              <Link
                                to={`/edit-task/${task._id}`}
                                className='size-8 flex items-center justify-center rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors'
                                title='Edit task'
                              >
                                <span className='material-symbols-outlined text-lg'>
                                  edit
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!tableLoading && totalTasks > PAGE_LIMIT && (
              <div className='p-6 border-t border-slate-200 dark:border-[#30363d] flex items-center justify-between'>
                <span className='text-sm text-slate-500'>
                  Showing{' '}
                  <span className='font-semibold'>
                    {(page - 1) * PAGE_LIMIT + 1}–
                    {Math.min(page * PAGE_LIMIT, totalTasks)}
                  </span>{' '}
                  of <span className='font-semibold'>{totalTasks}</span> tasks
                </span>
                <div className='flex gap-2'>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className='px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#30363d] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        page === n
                          ? 'bg-primary text-white border-primary font-bold'
                          : 'border-slate-200 dark:border-[#30363d] hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className='px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#30363d] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
