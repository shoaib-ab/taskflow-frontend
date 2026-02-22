import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import FullScreenLoader from '../components/FullScreenLoader';

// ─── helpers ─────────────────────────────────────────────────────────────────
const PAGE_LIMIT = 8;

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// ─── Create Team Modal ────────────────────────────────────────────────────────
function CreateTeamModal({ onClose, onCreated, allUsers, role }) {
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Team name is required.');
    setSubmitting(true);
    setError('');
    try {
      const body = { name: name.trim() };
      if (role === 'admin' && managerId) body.managerId = managerId;
      const { data } = await api.post('/teams', body);
      onCreated(data.team);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl'>
        <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
              <span className='material-symbols-outlined text-primary'>
                group_add
              </span>
            </div>
            <h2 className='text-lg font-bold'>Create New Team</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-slate-400'>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {error && (
            <div className='px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-medium'>
              {error}
            </div>
          )}

          <div className='space-y-1.5'>
            <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
              Team Name <span className='text-red-500'>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Engineering, Design Team…'
              className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
            />
          </div>

          {/* Admin can assign a specific manager */}
          {role === 'admin' && allUsers.length > 0 && (
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                Assign Manager{' '}
                <span className='text-slate-400 font-normal'>(optional)</span>
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
              >
                <option value=''>— You (default) —</option>
                {allUsers
                  .filter((u) => u.role === 'manager' || u.role === 'admin')
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {submitting ? (
                <>
                  <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Creating…
                </>
              ) : (
                <>
                  <span className='material-symbols-outlined text-[18px]'>
                    add
                  </span>
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Members Modal ────────────────────────────────────────────────────────────
function MembersModal({ team, onClose, onUpdated, allUsers, role }) {
  const [members, setMembers] = useState(team.members || []);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [manualId, setManualId] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const handleAdd = async () => {
    const userId = role === 'admin' ? selectedUserId : manualId.trim();
    if (!userId) return setAddError('Please select or enter a user ID.');
    setAdding(true);
    setAddError('');
    try {
      const { data } = await api.post(`/teams/${team._id}/members`, {
        userId,
      });
      setMembers(data.team.members || []);
      setSelectedUserId('');
      setManualId('');
      onUpdated(data.team);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberId) => {
    setRemovingId(memberId);
    try {
      const { data } = await api.delete(
        `/teams/${team._id}/members/${memberId}`,
      );
      setMembers(data.team.members || []);
      onUpdated(data.team);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  // Users already NOT in the team (for dropdown)
  const memberIds = new Set(members.map((m) => m._id ?? m));
  const addableUsers = allUsers.filter((u) => !memberIds.has(u._id));

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 shrink-0'>
          <div>
            <h2 className='text-lg font-bold'>{team.name}</h2>
            <p className='text-xs text-slate-500 mt-0.5'>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
          >
            <span className='material-symbols-outlined text-slate-400'>
              close
            </span>
          </button>
        </div>

        {/* Members list */}
        <div className='flex-1 overflow-y-auto p-4 space-y-2'>
          {members.length === 0 ? (
            <div className='text-center py-8 text-slate-400'>
              <span className='material-symbols-outlined text-4xl block mb-2'>
                group
              </span>
              <p className='text-sm'>No members yet</p>
            </div>
          ) : (
            members.map((m) => {
              const id = m._id ?? m;
              const name = m.name ?? id;
              const email = m.email ?? '';
              return (
                <div
                  key={id}
                  className='flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 group'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0'>
                      {getInitials(name)}
                    </div>
                    <div>
                      <p className='text-sm font-semibold'>{name}</p>
                      {email && (
                        <p className='text-xs text-slate-500'>{email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    disabled={removingId === id}
                    className='p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10 disabled:opacity-50'
                  >
                    {removingId === id ? (
                      <span className='w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin block' />
                    ) : (
                      <span className='material-symbols-outlined text-[18px]'>
                        person_remove
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add member section */}
        <div className='p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 shrink-0'>
          {addError && (
            <p className='text-xs text-red-500 font-medium px-1'>{addError}</p>
          )}
          <div className='flex gap-2'>
            {role === 'admin' && addableUsers.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className='flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              >
                <option value=''>Select a user to add…</option>
                {addableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder='Paste user ID to add…'
                className='flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              />
            )}
            <button
              onClick={handleAdd}
              disabled={adding}
              className='px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-1.5 shrink-0'
            >
              {adding ? (
                <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <span className='material-symbols-outlined text-[18px]'>
                  person_add
                </span>
              )}
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Teams Page ───────────────────────────────────────────────────────────────
const Teams = () => {
  const {
    user: { name, email, role },
    logout,
  } = useAuth();

  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [membersTeam, setMembersTeam] = useState(null); // team whose members modal is open
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // ── fetch teams ──
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams');
      setTeams(data.teams ?? data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── fetch all users (admin only) for dropdowns ──
  const fetchUsers = useCallback(async () => {
    if (role !== 'admin') return;
    try {
      const { data } = await api.get('/users');
      setAllUsers(data.users ?? data ?? []);
    } catch {
      // non-admin or error — silently ignore
    }
  }, [role]);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [fetchTeams, fetchUsers]);

  // ── filtered + paginated ──
  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    const managerName =
      typeof t.manager === 'object' ? (t.manager?.name ?? '') : '';
    return (
      t.name.toLowerCase().includes(q) || managerName.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));
  const paginated = filtered.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  // ── reset page on search ──
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── handlers ──
  const handleCreated = (team) => {
    setTeams((prev) => [team, ...prev]);
  };

  const handleUpdated = (updated) => {
    setTeams((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    if (membersTeam?._id === updated._id) setMembersTeam(updated);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Delete this team? This action cannot be undone.'))
      return;
    setDeletingId(teamId);
    try {
      await api.delete(`/teams/${teamId}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete team.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* Modals */}
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          allUsers={allUsers}
          role={role}
        />
      )}
      {membersTeam && (
        <MembersModal
          team={membersTeam}
          onClose={() => setMembersTeam(null)}
          onUpdated={handleUpdated}
          allUsers={allUsers}
          role={role}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className='w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex flex-col shrink-0'>
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

        <nav className='flex-1 px-4 space-y-1 mt-4'>
          <Link
            to='/dashboard'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
          >
            <span className='material-symbols-outlined'>dashboard</span>
            <span>Dashboard</span>
          </Link>

          {/* Active: Teams */}
          <a className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors'>
            <span
              className='material-symbols-outlined'
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            <span>Teams</span>
          </a>

          <Link
            to='/analytics'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
          >
            <span className='material-symbols-outlined'>monitoring</span>
            <span>Analytics</span>
          </Link>

          {role === 'admin' && (
            <Link
              to='/admin/users'
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
            >
              <span className='material-symbols-outlined'>manage_accounts</span>
              <span>User Management</span>
            </Link>
          )}

          <div className='pt-8 pb-2'>
            <p className='px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
              Account
            </p>
          </div>

          <Link
            to='/profile'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
          >
            <span className='material-symbols-outlined'>manage_accounts</span>
            <span>Profile &amp; Settings</span>
          </Link>

          <a
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer'
            onClick={logout}
          >
            <span className='material-symbols-outlined'>logout</span>
            <span>Logout</span>
          </a>
        </nav>

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

      {/* ── Main Content ── */}
      <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Header */}
        <header className='h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex items-center justify-between px-8 shrink-0'>
          <h2 className='text-xl font-bold'>Teams</h2>
          <div className='flex items-center gap-4'>
            <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors'>
              <span className='material-symbols-outlined'>notifications</span>
            </button>
            <div className='h-8 w-px bg-slate-200 dark:bg-slate-700' />
            <div className='flex items-center gap-3'>
              <div className='text-right hidden sm:block'>
                <p className='text-sm font-semibold leading-none'>{name}</p>
                <p className='text-xs text-slate-500 mt-1 capitalize'>{role}</p>
              </div>
              <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20'>
                {getInitials(name)}
              </div>
            </div>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto p-8 space-y-8'>
          {/* Page Title & Actions */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div>
              <h3 className='text-3xl font-black tracking-tight'>
                Team Management
              </h3>
              <p className='text-slate-500 dark:text-slate-400 mt-2 max-w-lg'>
                {role === 'admin'
                  ? 'View and manage all teams across your organisation.'
                  : 'Manage your teams and their members.'}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className='md:w-auto w-full bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2'
            >
              <span className='material-symbols-outlined text-[20px]'>add</span>
              New Team
            </button>
          </div>

          {/* Search */}
          <div className='relative'>
            <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'>
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by team name or manager…'
              className='w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400'
            />
          </div>

          {/* Error */}
          {error && (
            <div className='px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-medium'>
              {error}
            </div>
          )}

          {/* Table */}
          <div className='bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm'>
            {loading ? (
              <div className='flex items-center justify-center py-24'>
                <div className='w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin' />
              </div>
            ) : paginated.length === 0 ? (
              <div className='text-center py-24 text-slate-400'>
                <span className='material-symbols-outlined text-5xl block mb-3'>
                  group_off
                </span>
                <p className='font-semibold'>
                  {search ? 'No teams match your search.' : 'No teams yet.'}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className='mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors'
                  >
                    Create your first team
                  </button>
                )}
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700'>
                      <th className='px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                        Team
                      </th>
                      <th className='px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                        Manager
                      </th>
                      <th className='px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                        Members
                      </th>
                      <th className='px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                        Created
                      </th>
                      <th className='px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
                    {paginated.map((team) => {
                      const managerName =
                        typeof team.manager === 'object'
                          ? (team.manager?.name ?? 'Unknown')
                          : 'Unknown';
                      const managerEmail =
                        typeof team.manager === 'object'
                          ? (team.manager?.email ?? '')
                          : '';
                      const memberCount = team.members?.length ?? 0;

                      return (
                        <tr
                          key={team._id}
                          className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group'
                        >
                          {/* Team */}
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0'>
                                {getInitials(team.name)}
                              </div>
                              <p className='font-bold text-slate-900 dark:text-slate-100'>
                                {team.name}
                              </p>
                            </div>
                          </td>

                          {/* Manager */}
                          <td className='px-6 py-4'>
                            <p className='text-sm font-semibold'>
                              {managerName}
                            </p>
                            {managerEmail && (
                              <p className='text-xs text-slate-500'>
                                {managerEmail}
                              </p>
                            )}
                          </td>

                          {/* Members */}
                          <td className='px-6 py-4'>
                            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20'>
                              <span className='material-symbols-outlined text-[14px]'>
                                group
                              </span>
                              {memberCount}{' '}
                              {memberCount === 1 ? 'member' : 'members'}
                            </span>
                          </td>

                          {/* Created */}
                          <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                            {team.createdAt ? fmt(team.createdAt) : '—'}
                          </td>

                          {/* Actions */}
                          <td className='px-6 py-4 text-right'>
                            <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <button
                                onClick={() => setMembersTeam(team)}
                                title='Manage members'
                                className='p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors'
                              >
                                <span className='material-symbols-outlined text-[20px]'>
                                  manage_accounts
                                </span>
                              </button>
                              <button
                                onClick={() => handleDelete(team._id)}
                                disabled={deletingId === team._id}
                                title='Delete team'
                                className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50'
                              >
                                {deletingId === team._id ? (
                                  <span className='w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin block' />
                                ) : (
                                  <span className='material-symbols-outlined text-[20px]'>
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
            )}

            {/* Pagination */}
            {!loading && filtered.length > PAGE_LIMIT && (
              <div className='px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50'>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Showing{' '}
                  <span className='font-semibold dark:text-slate-100'>
                    {(page - 1) * PAGE_LIMIT + 1}–
                    {Math.min(page * PAGE_LIMIT, filtered.length)}
                  </span>{' '}
                  of{' '}
                  <span className='font-semibold dark:text-slate-100'>
                    {filtered.length}
                  </span>{' '}
                  teams
                </p>
                <div className='flex gap-2'>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className='p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    <span className='material-symbols-outlined'>
                      chevron_left
                    </span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          page === n
                            ? 'bg-primary text-white font-bold'
                            : 'hover:bg-slate-200 dark:hover:bg-[#1e293b]'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className='p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    <span className='material-symbols-outlined'>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className='flex flex-wrap gap-4 items-center'>
            <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>
              Legend:
            </span>
            <div className='flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg'>
              <div className='w-1.5 h-1.5 rounded-full bg-primary' />
              <span className='text-xs font-bold text-primary'>
                Member Count (Blue)
              </span>
            </div>
            <div className='flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg'>
              <div className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
              <span className='text-xs font-bold text-emerald-500'>
                Active Team
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Teams;
