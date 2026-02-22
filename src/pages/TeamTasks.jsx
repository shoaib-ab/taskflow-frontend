import { useEffect, useState, useCallback } from 'react';
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING: {
    label: 'Pending',
    cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    cls: 'bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400 ring-indigo-200 dark:ring-blue-500/30',
  },
  DONE: {
    label: 'Done',
    cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30',
  },
};

const PAGE_LIMIT = 10;

// ─── Component ────────────────────────────────────────────────────────────────
const TeamTasks = () => {
  const navigate = useNavigate();
  const {
    user: { name, role },
    logout,
  } = useAuth();

  // ── stats (full fetch once) ──
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── table ──
  const [tasks, setTasks] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');

  // ── filters ──
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [memberOptions, setMemberOptions] = useState([]); // { _id, name }

  // ── pagination ──
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // ─── delete confirm (inline) ──────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);

  // ── debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch stats once; also build member dropdown from unique assignees ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/tasks/all', {
        params: { limit: 9999, page: 1 },
      });
      const all = data.tasks ?? [];

      setStats({
        total: all.length,
        pending: all.filter((t) => t.status === 'PENDING').length,
        inProgress: all.filter((t) => t.status === 'IN_PROGRESS').length,
        done: all.filter((t) => t.status === 'DONE').length,
      });

      // Unique assignees for member filter
      const seen = new Map();
      all.forEach((t) => {
        if (t.assignedTo && typeof t.assignedTo === 'object') {
          seen.set(t.assignedTo._id, t.assignedTo.name);
        }
      });
      setMemberOptions(
        [...seen.entries()].map(([_id, name]) => ({ _id, name })),
      );
    } catch {
      // silently ignore stats failure
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── fetch paginated/filtered tasks ──
  const fetchTasks = useCallback(async () => {
    setTableLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (memberFilter) params.assignedTo = memberFilter;
      const { data } = await api.get('/tasks/all', { params });
      setTasks(data.tasks ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalTasks(data.totalTasks ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setTableLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, memberFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, memberFilter]);

  // ── delete handler ──
  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeletingId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setTotalTasks((n) => n - 1);
      // refresh stats quietly
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── stat cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      icon: 'assignment',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      color: 'text-blue-600 dark:text-blue-400',
      label: 'Total Tasks',
      value: stats.total,
    },
    {
      icon: 'schedule',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      color: 'text-amber-600 dark:text-amber-400',
      label: 'Pending',
      value: stats.pending,
    },
    {
      icon: 'pending',
      bg: 'bg-indigo-50 dark:bg-blue-500/10',
      color: 'text-indigo-600 dark:text-blue-400',
      label: 'In Progress',
      value: stats.inProgress,
    },
    {
      icon: 'check_circle',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      color: 'text-emerald-600 dark:text-emerald-400',
      label: 'Done',
      value: stats.done,
    },
  ];

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* ── Sidebar ── */}
      <aside className='w-64 border-r border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] flex flex-col shrink-0'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-10'>
            <div className='size-8 bg-primary rounded-lg flex items-center justify-center text-white'>
              <span className='material-symbols-outlined text-xl'>
                grid_view
              </span>
            </div>
            <h2 className='text-slate-900 dark:text-white text-xl font-bold tracking-tight'>
              TaskMaster
            </h2>
          </div>

          <nav className='space-y-1'>
            <Link
              to='/dashboard'
              className='flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group'
            >
              <span className='material-symbols-outlined text-slate-400 group-hover:text-primary'>
                dashboard
              </span>
              <span className='font-medium'>Overview</span>
            </Link>

            {/* Active */}
            <div className='flex items-center gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 text-primary border-r-4 border-primary rounded-l-lg'>
              <span className='material-symbols-outlined'>assignment</span>
              <span className='font-medium'>Team Tasks</span>
            </div>

            <Link
              to='/teams'
              className='flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group'
            >
              <span className='material-symbols-outlined text-slate-400 group-hover:text-primary'>
                group
              </span>
              <span className='font-medium'>Teams</span>
            </Link>

            <Link
              to='/analytics'
              className='flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group'
            >
              <span className='material-symbols-outlined text-slate-400 group-hover:text-primary'>
                monitoring
              </span>
              <span className='font-medium'>Analytics</span>
            </Link>

            {role === 'admin' && (
              <Link
                to='/admin/users'
                className='flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group'
              >
                <span className='material-symbols-outlined text-slate-400 group-hover:text-primary'>
                  manage_accounts
                </span>
                <span className='font-medium'>User Management</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User card */}
        <div className='mt-auto p-6 border-t border-slate-100 dark:border-[#30363d]'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-white dark:ring-[#0d1117] flex-shrink-0'>
              {getInitials(name)}
            </div>
            <div className='overflow-hidden flex-1'>
              <p className='text-sm font-bold text-slate-900 dark:text-white truncate'>
                {name}
              </p>
              <p className='text-xs text-slate-500 truncate capitalize'>
                {role}
              </p>
            </div>
            <Link
              to='/profile'
              className='ml-auto text-slate-400 hover:text-primary transition-colors'
              title='Profile &amp; Settings'
            >
              <span className='material-symbols-outlined text-sm'>
                manage_accounts
              </span>
            </Link>
            <button
              onClick={logout}
              className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
              title='Logout'
            >
              <span className='material-symbols-outlined text-sm'>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className='flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f1115]'>
        <div className='max-w-7xl mx-auto p-8 lg:p-10'>
          {/* Page heading */}
          <div className='flex justify-between items-center mb-10'>
            <div>
              <h1 className='text-2xl font-black tracking-tight'>
                Team Task Management
              </h1>
              <p className='text-slate-500 dark:text-slate-400 mt-1'>
                Manage, track, and assign tasks across your team.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-task')}
              className='flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all'
            >
              <span className='material-symbols-outlined text-lg'>add</span>
              <span>Create New Task</span>
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
            {statCards.map((card) => (
              <div
                key={card.label}
                className='bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-[#30363d] shadow-sm flex flex-col'
              >
                <div
                  className={`size-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4`}
                >
                  <span className='material-symbols-outlined'>{card.icon}</span>
                </div>
                <p className='text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1'>
                  {card.label}
                </p>
                <h3 className='text-3xl font-black leading-none'>
                  {statsLoading ? (
                    <span className='inline-block w-10 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse' />
                  ) : (
                    card.value
                  )}
                </h3>
              </div>
            ))}
          </div>

          {/* ── Task table card ── */}
          <div className='bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] shadow-sm overflow-hidden'>
            {/* Filters bar */}
            <div className='p-6 border-b border-slate-100 dark:border-[#30363d] flex flex-wrap gap-4 items-center justify-between'>
              {/* Search */}
              <div className='flex flex-1 min-w-[260px] items-center gap-3 bg-slate-100 dark:bg-[#0f1115] px-4 py-2 rounded-lg border border-transparent focus-within:border-primary/40 focus-within:bg-white dark:focus-within:bg-[#0d1117] transition-all'>
                <span className='material-symbols-outlined text-slate-400 text-lg'>
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='bg-transparent border-none focus:ring-0 p-0 text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100 outline-none'
                  placeholder='Search tasks by title, description…'
                />
              </div>

              {/* Dropdowns */}
              <div className='flex items-center gap-3'>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='text-sm border border-slate-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0f1115] text-slate-700 dark:text-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all'
                >
                  <option value=''>All Status</option>
                  <option value='PENDING'>Pending</option>
                  <option value='IN_PROGRESS'>In Progress</option>
                  <option value='DONE'>Done</option>
                </select>

                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className='text-sm border border-slate-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0f1115] text-slate-700 dark:text-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all'
                >
                  <option value=''>All Members</option>
                  {memberOptions.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
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
                    {search || statusFilter || memberFilter
                      ? 'No tasks match your filters.'
                      : 'No tasks yet.'}
                  </p>
                  {!search && !statusFilter && !memberFilter && (
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
                    <tr className='bg-slate-50/50 dark:bg-[#0f1115]/50 border-b border-slate-100 dark:border-[#30363d]'>
                      {[
                        'Task Title',
                        'Assigned To',
                        'Status',
                        'Due Date',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 dark:divide-[#30363d]'>
                    {tasks.map((task) => {
                      const cfg = STATUS_CFG[task.status] ?? STATUS_CFG.PENDING;
                      const assignedName =
                        typeof task.assignedTo === 'object'
                          ? (task.assignedTo?.name ?? 'Unassigned')
                          : 'Unassigned';
                      const due = task.dueDate;
                      const overdue = isOverdue(due, task.status);

                      return (
                        <tr
                          key={task._id}
                          className='hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors'
                        >
                          {/* Title */}
                          <td className='px-6 py-4'>
                            <div className='flex flex-col'>
                              <span className='text-sm font-bold'>
                                {task.title}
                              </span>
                              {task.description && (
                                <span className='text-xs text-slate-500 mt-0.5 truncate max-w-[240px]'>
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Assigned To */}
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0'>
                                {getInitials(assignedName)}
                              </div>
                              <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                                {assignedName}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className='px-6 py-4'>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className='px-6 py-4'>
                            <span
                              className={`text-sm font-medium ${
                                overdue
                                  ? 'text-rose-500 font-bold'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {overdue && '⚠ '}
                              {fmtDate(due)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className='px-6 py-4 text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Link
                                to={`/task/${task._id}`}
                                className='p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors'
                                title='View details'
                              >
                                <span className='material-symbols-outlined text-xl'>
                                  open_in_new
                                </span>
                              </Link>
                              <Link
                                to={`/edit-task/${task._id}`}
                                className='p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors'
                                title='Edit task'
                              >
                                <span className='material-symbols-outlined text-xl'>
                                  edit_square
                                </span>
                              </Link>
                              <button
                                onClick={() => handleDelete(task._id)}
                                disabled={deletingId === task._id}
                                className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors disabled:opacity-50'
                                title='Delete task'
                              >
                                {deletingId === task._id ? (
                                  <span className='w-5 h-5 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin block' />
                                ) : (
                                  <span className='material-symbols-outlined text-xl'>
                                    delete
                                  </span>
                                )}
                              </button>
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
            {!tableLoading && totalTasks > 0 && (
              <div className='p-6 border-t border-slate-100 dark:border-[#30363d] flex items-center justify-between'>
                <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
                  Showing{' '}
                  <span className='text-slate-900 dark:text-slate-100 font-bold'>
                    {(page - 1) * PAGE_LIMIT + 1}–
                    {Math.min(page * PAGE_LIMIT, totalTasks)}
                  </span>{' '}
                  of{' '}
                  <span className='text-slate-900 dark:text-slate-100 font-bold'>
                    {totalTasks}
                  </span>{' '}
                  tasks
                </p>
                <div className='flex gap-2'>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className='px-3 py-1.5 text-sm font-bold border border-slate-200 dark:border-[#30363d] rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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
                      className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-colors ${
                        page === n
                          ? 'bg-primary text-white border-primary'
                          : 'border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className='px-3 py-1.5 text-sm font-bold border border-slate-200 dark:border-[#30363d] rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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

export default TeamTasks;
