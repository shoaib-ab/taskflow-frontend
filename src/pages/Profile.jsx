import { useState } from 'react';
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

const formatMemberSince = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'security', label: 'Security', icon: 'shield' },
  { key: 'danger', label: 'Danger Zone', icon: 'warning', danger: true },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm transition-all ${
      type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
    }`}
  >
    <span className='material-symbols-outlined text-base'>
      {type === 'error' ? 'error' : 'check_circle'}
    </span>
    {msg}
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDeleteDialog = ({ onConfirm, onCancel }) => {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pw.trim()) {
      setErr('Password is required');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      await onConfirm(pw);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 p-8 max-w-md w-full shadow-2xl'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600'>
            <span className='material-symbols-outlined'>warning</span>
          </div>
          <h3 className='text-lg font-bold text-red-700 dark:text-red-400'>
            Delete Account
          </h3>
        </div>
        <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
          This action is{' '}
          <span className='font-bold text-red-600'>
            permanent and irreversible
          </span>
          . All your tasks and data will be wiped. Enter your password to
          confirm.
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='password'
            placeholder='Enter your password to confirm'
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all'
          />
          {err && <p className='text-xs text-red-500 font-medium'>{err}</p>}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-all'
            >
              {loading ? 'Deleting…' : 'Delete My Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ── Profile form state ──
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password form state ──
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // ─── toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Update Name ────────────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', {
        name: profileName.trim(),
      });
      updateUser(data.user);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update profile',
        'error',
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Update Password ─────────────────────────────────────────────────────────
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (pwForm.new.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
        confirmPassword: pwForm.confirm,
      });
      setPwForm({ current: '', new: '', confirm: '' });
      showToast('Password updated successfully');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to update password',
        'error',
      );
    } finally {
      setPwLoading(false);
    }
  };

  // ─── Delete Account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = async (password) => {
    try {
      await api.delete('/auth/account', { data: { password } });
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete account';
    }
  };

  const roleLabel =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'manager'
        ? 'Manager'
        : 'Member';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className='flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* ── Sidebar ── */}
      <aside className='w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark hidden md:flex flex-col fixed h-full z-20'>
        {/* Logo */}
        <div className='p-6 flex items-center gap-3'>
          <div className='bg-primary rounded-lg p-1.5 text-white'>
            <span className='material-symbols-outlined block'>task_alt</span>
          </div>
          <h1 className='text-lg font-bold tracking-tight'>TaskMaster Pro</h1>
        </div>

        {/* Nav */}
        <nav className='flex-1 px-3 space-y-1'>
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left ${
                  active
                    ? 'bg-primary/10 text-primary border-l-[3px] border-primary pl-[9px]'
                    : item.danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className='material-symbols-outlined text-[20px]'>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}

          <div className='pt-4 border-t border-slate-100 dark:border-slate-800 mt-4'>
            <Link
              to={
                user?.role === 'admin' || user?.role === 'manager'
                  ? '/manager-dashboard'
                  : '/dashboard'
              }
              className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors'
            >
              <span className='material-symbols-outlined text-[20px]'>
                arrow_back
              </span>
              Back to Dashboard
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className='p-4 border-t border-slate-200 dark:border-slate-800'>
          <div className='flex items-center gap-3 px-2 py-2'>
            <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20'>
              {getInitials(user?.name)}
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-xs font-semibold truncate'>
                {user?.name}
              </span>
              <span className='text-[10px] text-slate-500 capitalize'>
                {user?.role} account
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className='flex-1 md:ml-64 p-4 md:p-8 lg:p-12'>
        <div className='max-w-3xl mx-auto space-y-8'>
          {/* Page header */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {activeSection === 'profile' && 'Profile Settings'}
              {activeSection === 'security' && 'Password & Security'}
              {activeSection === 'danger' && 'Danger Zone'}
            </h2>
            <p className='text-slate-500 text-sm mt-1'>
              {activeSection === 'profile' &&
                'Manage your public information visible to teammates.'}
              {activeSection === 'security' &&
                'Update your password and manage account security.'}
              {activeSection === 'danger' &&
                'Irreversible and destructive actions — proceed with care.'}
            </p>
          </div>

          {/* ── Profile Section ── */}
          {activeSection === 'profile' && (
            <section className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm'>
              <div className='p-6 border-b border-slate-100 dark:border-slate-800'>
                <h3 className='font-semibold text-lg'>Public Profile</h3>
              </div>
              <form onSubmit={handleProfileSave} className='p-6 space-y-6'>
                {/* Avatar + Info */}
                <div className='flex items-center gap-6'>
                  <div className='relative group shrink-0'>
                    <div className='size-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-bold'>
                      {getInitials(profileName || user?.name)}
                    </div>
                    <div className='absolute bottom-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 size-8 rounded-full flex items-center justify-center shadow-sm'>
                      <span className='material-symbols-outlined text-sm text-slate-500'>
                        edit
                      </span>
                    </div>
                  </div>
                  <div className='space-y-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h4 className='text-xl font-bold truncate'>
                        {user?.name}
                      </h4>
                      <span className='px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20 shrink-0'>
                        {roleLabel}
                      </span>
                    </div>
                    <p className='text-slate-500 text-sm truncate'>
                      {user?.email}
                    </p>
                    {user?.createdAt && (
                      <p className='text-xs text-slate-400'>
                        Member since {formatMemberSince(user.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Name field */}
                <div className='grid gap-2 max-w-md'>
                  <label
                    className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    htmlFor='full-name'
                  >
                    Full Name
                  </label>
                  <input
                    id='full-name'
                    type='text'
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all'
                  />
                  <p className='text-[12px] text-slate-400'>
                    This is your display name visible to other team members.
                  </p>
                </div>

                {/* Email (read-only) */}
                <div className='grid gap-2 max-w-md'>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    value={user?.email ?? ''}
                    readOnly
                    className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed'
                  />
                  <p className='text-[12px] text-slate-400'>
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </form>
              <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end'>
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading || profileName.trim() === user?.name}
                  className='bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {profileLoading && (
                    <span className='size-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  )}
                  {profileLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </section>
          )}

          {/* ── Security Section ── */}
          {activeSection === 'security' && (
            <section className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm'>
              <div className='p-6 border-b border-slate-100 dark:border-slate-800'>
                <h3 className='font-semibold text-lg'>
                  Password &amp; Security
                </h3>
              </div>
              <form onSubmit={handlePasswordUpdate} className='p-6 space-y-5'>
                {/* Current Password */}
                <div className='grid gap-2 max-w-md'>
                  <label
                    className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    htmlFor='current-password'
                  >
                    Current Password
                  </label>
                  <input
                    id='current-password'
                    type='password'
                    placeholder='••••••••'
                    value={pwForm.current}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, current: e.target.value }))
                    }
                    className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all'
                  />
                </div>

                {/* New Password */}
                <div className='grid gap-2 max-w-md'>
                  <label
                    className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    htmlFor='new-password'
                  >
                    New Password
                  </label>
                  <input
                    id='new-password'
                    type='password'
                    placeholder='At least 6 characters'
                    value={pwForm.new}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, new: e.target.value }))
                    }
                    className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all'
                  />
                  {/* Password strength indicator */}
                  {pwForm.new && (
                    <div className='flex gap-1 mt-1'>
                      {[1, 2, 3, 4].map((i) => {
                        const len = pwForm.new.length;
                        const hasUpper = /[A-Z]/.test(pwForm.new);
                        const hasNum = /[0-9]/.test(pwForm.new);
                        const hasSpecial = /[^a-zA-Z0-9]/.test(pwForm.new);
                        const score =
                          (len >= 8 ? 1 : 0) +
                          (hasUpper ? 1 : 0) +
                          (hasNum ? 1 : 0) +
                          (hasSpecial ? 1 : 0);
                        return (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i <= score
                                ? score <= 1
                                  ? 'bg-red-500'
                                  : score <= 2
                                    ? 'bg-amber-500'
                                    : score <= 3
                                      ? 'bg-yellow-500'
                                      : 'bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        );
                      })}
                      <span className='text-[10px] text-slate-400 ml-1'>
                        {(() => {
                          const len = pwForm.new.length;
                          const score =
                            (len >= 8 ? 1 : 0) +
                            (/[A-Z]/.test(pwForm.new) ? 1 : 0) +
                            (/[0-9]/.test(pwForm.new) ? 1 : 0) +
                            (/[^a-zA-Z0-9]/.test(pwForm.new) ? 1 : 0);
                          return (
                            [
                              'Very Weak',
                              'Weak',
                              'Fair',
                              'Strong',
                              'Very Strong',
                            ][score] || ''
                          );
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className='grid gap-2 max-w-md'>
                  <label
                    className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    htmlFor='confirm-password'
                  >
                    Confirm New Password
                  </label>
                  <input
                    id='confirm-password'
                    type='password'
                    placeholder='Repeat new password'
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className={`w-full rounded-lg border bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-1 outline-none transition-all ${
                      pwForm.confirm && pwForm.new !== pwForm.confirm
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {pwForm.confirm && pwForm.new !== pwForm.confirm && (
                    <p className='text-xs text-red-500 font-medium'>
                      Passwords do not match
                    </p>
                  )}
                </div>
              </form>
              <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end'>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={
                    pwLoading ||
                    !pwForm.current ||
                    !pwForm.new ||
                    !pwForm.confirm
                  }
                  className='bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {pwLoading && (
                    <span className='size-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  )}
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </section>
          )}

          {/* ── Danger Zone ── */}
          {activeSection === 'danger' && (
            <section className='border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm bg-red-50/30 dark:bg-red-900/5'>
              <div className='p-6'>
                <div className='flex items-start justify-between gap-4 flex-wrap'>
                  <div className='space-y-1'>
                    <h3 className='font-bold text-red-700 dark:text-red-400 text-lg flex items-center gap-2'>
                      <span className='material-symbols-outlined text-red-600'>
                        warning
                      </span>
                      Danger Zone
                    </h3>
                    <p className='text-sm text-slate-600 dark:text-slate-400 max-w-md'>
                      Once you delete your account, there is no going back. All
                      your tasks, projects, and personal data will be
                      permanently wiped from our servers.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className='bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm whitespace-nowrap'
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className='pt-10 pb-6 text-center'>
            <p className='text-xs text-slate-400 flex items-center justify-center gap-1 flex-wrap'>
              © {new Date().getFullYear()} TaskMaster Pro &bull;{' '}
              <a className='hover:underline' href='#'>
                Privacy Policy
              </a>{' '}
              &bull;{' '}
              <a className='hover:underline' href='#'>
                Terms of Service
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Delete confirm dialog */}
      {showDeleteDialog && (
        <ConfirmDeleteDialog
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
};

export default Profile;
