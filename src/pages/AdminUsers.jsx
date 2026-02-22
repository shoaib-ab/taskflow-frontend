import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import FullScreenLoader from '../components/FullScreenLoader';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const ROLE_STYLES = {
  admin: {
    badge:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/50',
    avatar: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  manager: {
    badge:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50',
    avatar:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  member: {
    badge:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50',
    avatar: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
};

const ROLES = ['admin', 'manager', 'member'];
const PAGE_LIMIT = 10;

// ─── Component ────────────────────────────────────────────────────────────────

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which userId is being acted on

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users);
      setTotalUsers(res.data.users.length);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Derived — filtered + paginated ──────────────────────────────────────────
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));
  const paginated = filtered.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Change role ─────────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) return; // can't change own role
    try {
      setActionLoading(userId);
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete user ─────────────────────────────────────────────────────────────
  const handleDelete = async (userId, userName) => {
    if (userId === currentUser.id) {
      alert("You can't delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`))
      return;
    try {
      setActionLoading(userId);
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display'>
      {loading && <FullScreenLoader />}
      <ThemeToggle />

      <div className='flex h-screen overflow-hidden'>
        {/* ── Sidebar ── */}
        <aside className='w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex flex-col shrink-0'>
          <div className='p-6 flex items-center gap-3'>
            <div className='bg-primary p-1.5 rounded-lg flex items-center justify-center'>
              <span className='material-symbols-outlined text-white text-2xl'>
                layers
              </span>
            </div>
            <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase'>
              TaskFlow
            </h1>
          </div>

          <nav className='flex-1 px-4 space-y-1 mt-4'>
            <Link
              to='/dashboard'
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>dashboard</span>
              <span>All Tasks</span>
            </Link>
            <Link
              to='/dashboard'
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>schedule</span>
              <span>Pending</span>
            </Link>
            <Link
              to='/admin/users'
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>manage_accounts</span>
              <span>User Management</span>
            </Link>

            <div className='pt-8 pb-2'>
              <p className='px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                Teams
              </p>
            </div>
            <Link
              to='/teams'
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>groups</span>
              <span>Manage Teams</span>
            </Link>

            <button
              onClick={logout}
              className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>logout</span>
              <span>Logout</span>
            </button>
          </nav>

          <div className='p-4 border-t border-slate-200 dark:border-slate-800'>
            <div className='bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10'>
              <p className='text-xs font-bold text-primary mb-1 uppercase'>
                Admin Panel
              </p>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Enterprise organizational controls enabled.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className='flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden'>
          {/* Header */}
          <header className='h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex items-center justify-between px-8 shrink-0'>
            <div className='flex-1 max-w-xl'>
              <div className='relative group'>
                <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'>
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all dark:text-white placeholder:text-slate-400 outline-none'
                  placeholder='Search users...'
                  type='text'
                />
              </div>
            </div>

            <div className='flex items-center gap-4 ml-8'>
              <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative'>
                <span className='material-symbols-outlined'>notifications</span>
                <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#101622]'></span>
              </button>
              <div className='h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1'></div>
              <div className='flex items-center gap-3 pl-2'>
                <div className='text-right hidden sm:block'>
                  <p className='text-sm font-semibold text-slate-900 dark:text-white leading-none'>
                    {currentUser?.name}
                  </p>
                  <p className='text-xs text-slate-500 mt-1 capitalize'>
                    {currentUser?.role}
                  </p>
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    ROLE_STYLES[currentUser?.role]?.avatar ??
                    'bg-slate-200 text-slate-600'
                  }`}
                >
                  {getInitials(currentUser?.name)}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-8'>
            {/* Page Title */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
              <div>
                <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tight'>
                  User Management
                </h2>
                <p className='text-slate-500 mt-1'>
                  Manage team roles, access levels, and organizational members.
                </p>
              </div>
              <div className='relative w-full md:w-80'>
                <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                  person_search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all dark:text-white placeholder:text-slate-400 outline-none'
                  placeholder='Find a team member...'
                  type='text'
                />
              </div>
            </div>

            {/* Table */}
            <div className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm'>
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr className='bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700'>
                    {[
                      'Member',
                      'Email Address',
                      'Role',
                      'Date Joined',
                      'Actions',
                    ].map((col, i) => (
                      <th
                        key={col}
                        className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 dark:divide-slate-700/50'>
                  {paginated.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className='px-6 py-12 text-center text-slate-400'
                      >
                        {search
                          ? 'No users match your search.'
                          : 'No users found.'}
                      </td>
                    </tr>
                  )}
                  {paginated.map((u) => {
                    const isSelf = u._id === currentUser?.id;
                    const style = ROLE_STYLES[u.role] ?? ROLE_STYLES.member;
                    const busy = actionLoading === u._id;

                    return (
                      <tr
                        key={u._id}
                        className='hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors'
                      >
                        {/* Member */}
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${style.avatar}`}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <span className='font-semibold text-slate-900 dark:text-white'>
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className='ml-2 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full'>
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className='px-6 py-4 text-sm text-slate-600 dark:text-slate-400'>
                          {u.email}
                        </td>

                        {/* Role badge */}
                        <td className='px-6 py-4'>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Date joined */}
                        <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </td>

                        {/* Actions */}
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-3'>
                            {/* Role selector */}
                            <select
                              value={u.role}
                              disabled={isSelf || busy}
                              onChange={(e) =>
                                handleRoleChange(u._id, e.target.value)
                              }
                              className='text-xs font-medium bg-slate-100 dark:bg-slate-700 border-none rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed outline-none cursor-pointer'
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.5rem center',
                                backgroundSize: '1em',
                                appearance: 'none',
                              }}
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </option>
                              ))}
                            </select>

                            {/* Delete button */}
                            <button
                              disabled={isSelf || busy}
                              onClick={() => handleDelete(u._id, u.name)}
                              className='p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed'
                              title={
                                isSelf
                                  ? "You can't delete your own account"
                                  : `Delete ${u.name}`
                              }
                            >
                              {busy ? (
                                <span className='material-symbols-outlined text-xl animate-spin'>
                                  progress_activity
                                </span>
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
            </div>

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 pb-12 mt-4'>
              <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
                Showing{' '}
                {filtered.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1}–
                {Math.min(page * PAGE_LIMIT, filtered.length)} of{' '}
                {filtered.length} members
              </p>

              <div className='flex items-center gap-2'>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <span className='material-symbols-outlined'>
                    chevron_left
                  </span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        page === p
                          ? 'bg-primary text-white'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <span className='material-symbols-outlined'>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
