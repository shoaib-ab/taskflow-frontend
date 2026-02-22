import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

// Status config
const STATUS_CFG = {
  PENDING: {
    label: 'Pending',
    icon: 'schedule',
    className:
      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: 'sync',
    className:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  },
  DONE: {
    label: 'Completed',
    icon: 'check_circle',
    className:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  },
};

const PRIORITY_CFG = {
  high: {
    label: 'High Priority',
    icon: 'priority_high',
    className:
      'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800',
  },
  medium: {
    label: 'Medium Priority',
    icon: 'drag_handle',
    className:
      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  },
  low: {
    label: 'Low Priority',
    icon: 'keyboard_arrow_down',
    className:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  },
};

// ─── Image lightbox ───────────────────────────────────────────────────────────
const Lightbox = ({ url, onClose }) => (
  <div
    className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
    onClick={onClose}
  >
    <div
      className='relative max-w-5xl w-full max-h-[90vh]'
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={url}
        alt='Full size attachment'
        className='w-full h-full object-contain rounded-xl'
      />
      <button
        onClick={onClose}
        className='absolute top-3 right-3 size-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors'
      >
        <span className='material-symbols-outlined'>close</span>
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user: { name, role },
    logout,
  } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Comments (local state — no backend for comments yet)
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const feedEndRef = useRef(null);

  // Fetch task
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data.task);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Scroll feed to bottom when comments added
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handlePost = () => {
    if (!commentText.trim()) return;
    setPosting(true);
    setTimeout(() => {
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          author: name,
          text: commentText.trim(),
          ts: new Date().toISOString(),
        },
      ]);
      setCommentText('');
      setPosting(false);
    }, 300);
  };

  // Build activity feed from task metadata
  const buildActivity = (t) => {
    const feed = [];
    // Created
    feed.push({
      type: 'log',
      icon: 'add_circle',
      iconClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
      html: (
        <>
          Task was{' '}
          <span className='font-bold text-slate-900 dark:text-white'>
            created
          </span>
        </>
      ),
      ts: t.createdAt,
    });
    // Status assignment
    if (t.status !== 'PENDING') {
      feed.push({
        type: 'log',
        icon: 'history',
        iconClass: 'bg-blue-100 dark:bg-blue-900/30 text-primary',
        html: (
          <>
            Status set to{' '}
            <span className='px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded text-xs font-bold'>
              {STATUS_CFG[t.status]?.label ?? t.status}
            </span>
          </>
        ),
        ts: t.updatedAt,
      });
    }
    // Priority
    feed.push({
      type: 'log',
      icon: 'flag',
      iconClass: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
      html: (
        <>
          Priority set to{' '}
          <span className='font-semibold text-slate-900 dark:text-white capitalize'>
            {t.priority}
          </span>
        </>
      ),
      ts: t.createdAt,
    });
    // Image
    if (t.image?.url) {
      feed.push({
        type: 'log',
        icon: 'attach_file',
        iconClass: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
        html: (
          <>
            An{' '}
            <span className='text-primary hover:underline cursor-pointer'>
              attachment
            </span>{' '}
            was uploaded
          </>
        ),
        ts: t.updatedAt,
      });
    }
    return feed;
  };

  // ─── Utilities ───────────────────────────────────────────────────────────────
  const canEdit =
    role === 'admin' ||
    role === 'manager' ||
    (task && task.userId?._id === undefined); // member who created it (best effort)

  const statusCfg = task
    ? (STATUS_CFG[task.status] ?? STATUS_CFG.PENDING)
    : null;
  const priorityCfg = task
    ? (PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.medium)
    : null;
  const activityFeed = task ? buildActivity(task) : [];

  const assigneeName = task?.assignedTo
    ? typeof task.assignedTo === 'object'
      ? task.assignedTo.name
      : '—'
    : '—';

  const creatorName = task?.userId
    ? typeof task.userId === 'object'
      ? task.userId.name
      : '—'
    : '—';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* ── Top Navigation Bar ── */}
      <header className='sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 lg:px-20 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2 text-primary'>
            <span className='material-symbols-outlined text-3xl font-bold'>
              account_tree
            </span>
            <h2 className='text-slate-900 dark:text-white text-lg font-extrabold tracking-tight'>
              TaskStream
            </h2>
          </div>
          <div className='hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64'>
            <span className='material-symbols-outlined text-slate-400 text-xl'>
              search
            </span>
            <input
              className='bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder:text-slate-400 ml-2'
              placeholder='Search tasks...'
              type='text'
            />
          </div>
        </div>

        <div className='flex items-center gap-6'>
          <nav className='hidden lg:flex items-center gap-6'>
            <Link
              to='/dashboard'
              className='text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors'
            >
              Dashboard
            </Link>
            {(role === 'admin' || role === 'manager') && (
              <Link
                to='/manager-dashboard'
                className='text-sm font-semibold text-primary'
              >
                Projects
              </Link>
            )}
            {(role === 'admin' || role === 'manager') && (
              <Link
                to='/teams'
                className='text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors'
              >
                Team
              </Link>
            )}
            {(role === 'admin' || role === 'manager') && (
              <Link
                to='/analytics'
                className='text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors'
              >
                Reports
              </Link>
            )}
          </nav>
          <div className='h-8 w-px bg-slate-200 dark:bg-slate-700' />
          <div className='flex items-center gap-3'>
            <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors'>
              <span className='material-symbols-outlined'>notifications</span>
            </button>
            <button
              onClick={logout}
              className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors'
              title='Logout'
            >
              <span className='material-symbols-outlined'>logout</span>
            </button>
            <div className='size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs'>
              {getInitials(name)}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className='flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-20 py-8'>
        {/* Breadcrumbs */}
        <nav className='flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap'>
          {role === 'admin' || role === 'manager' ? (
            <Link
              to='/manager-dashboard'
              className='hover:text-primary transition-colors'
            >
              Projects
            </Link>
          ) : (
            <Link
              to='/dashboard'
              className='hover:text-primary transition-colors'
            >
              Dashboard
            </Link>
          )}
          <span className='material-symbols-outlined text-base'>
            chevron_right
          </span>
          {role === 'admin' || role === 'manager' ? (
            <Link
              to='/team-tasks'
              className='hover:text-primary transition-colors'
            >
              All Tasks
            </Link>
          ) : (
            <Link
              to='/dashboard'
              className='hover:text-primary transition-colors'
            >
              My Tasks
            </Link>
          )}
          <span className='material-symbols-outlined text-base'>
            chevron_right
          </span>
          <span className='text-slate-900 dark:text-white font-medium'>
            Task Details
          </span>
        </nav>

        {/* Error State */}
        {error && (
          <div className='flex flex-col items-center justify-center py-32 gap-4'>
            <span className='material-symbols-outlined text-5xl text-slate-300'>
              error_outline
            </span>
            <p className='text-slate-500 text-lg font-semibold'>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-primary font-bold hover:underline'
            >
              <span className='material-symbols-outlined text-sm'>
                arrow_back
              </span>
              Go back
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className='flex flex-col lg:grid lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-8 space-y-6'>
              <div className='space-y-3 animate-pulse'>
                <div className='h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4' />
                <div className='h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3' />
              </div>
              <div className='h-px bg-slate-200 dark:bg-slate-800' />
              <div className='space-y-3 animate-pulse'>
                <div className='h-4 bg-slate-100 dark:bg-slate-800 rounded' />
                <div className='h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6' />
                <div className='h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6' />
              </div>
            </div>
            <div className='lg:col-span-4'>
              <div className='h-[calc(100vh-12rem)] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse' />
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && !error && task && (
          <div className='flex flex-col lg:grid lg:grid-cols-12 gap-8'>
            {/* ── Left Column ── */}
            <div className='lg:col-span-8 space-y-6'>
              {/* Task Heading */}
              <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
                <div className='space-y-2'>
                  <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight'>
                    {task.title}
                  </h1>
                  <div className='flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm'>
                    <div className='flex items-center gap-1.5'>
                      <span className='material-symbols-outlined text-lg'>
                        calendar_today
                      </span>
                      <span>Created {formatDate(task.createdAt)}</span>
                    </div>
                    {creatorName !== '—' && (
                      <div className='flex items-center gap-1.5'>
                        <span className='material-symbols-outlined text-lg'>
                          person
                        </span>
                        <span>
                          By{' '}
                          <span className='text-primary font-medium'>
                            {creatorName}
                          </span>
                        </span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div
                        className={`flex items-center gap-1.5 ${
                          new Date(task.dueDate) < new Date() &&
                          task.status !== 'DONE'
                            ? 'text-red-500 font-semibold'
                            : ''
                        }`}
                      >
                        <span className='material-symbols-outlined text-lg'>
                          event
                        </span>
                        <span>Due {formatDate(task.dueDate)}</span>
                        {new Date(task.dueDate) < new Date() &&
                          task.status !== 'DONE' && (
                            <span className='text-[10px] bg-red-500/10 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase'>
                              Overdue
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                {(role === 'admin' || role === 'manager') && (
                  <button
                    onClick={() => navigate(`/edit-task/${task._id}`)}
                    className='inline-flex shrink-0 items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20'
                  >
                    <span className='material-symbols-outlined text-xl'>
                      edit
                    </span>
                    <span>Edit Task</span>
                  </button>
                )}
              </div>

              {/* Metadata Badges */}
              <div className='flex flex-wrap gap-3 py-4 border-y border-slate-200 dark:border-slate-800'>
                {/* Status */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusCfg.className}`}
                >
                  <span className='material-symbols-outlined text-lg'>
                    {statusCfg.icon}
                  </span>
                  {statusCfg.label}
                </div>
                {/* Priority */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${priorityCfg.className}`}
                >
                  <span className='material-symbols-outlined text-lg'>
                    {priorityCfg.icon}
                  </span>
                  {priorityCfg.label}
                </div>
                {/* Team tag placeholder */}
                <div className='flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700'>
                  <span className='material-symbols-outlined text-lg'>
                    task_alt
                  </span>
                  Task
                </div>
                {/* Assignee avatars */}
                {assigneeName !== '—' && (
                  <div className='ml-auto flex items-center gap-2'>
                    <div
                      className='size-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-white dark:ring-slate-900'
                      title={assigneeName}
                    >
                      {getInitials(assigneeName)}
                    </div>
                    <span className='text-xs text-slate-500 font-medium'>
                      {assigneeName}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <section>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>
                  Description
                </h3>
                {task.description ? (
                  <div className='text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap'>
                    {task.description}
                  </div>
                ) : (
                  <p className='text-slate-400 italic text-sm'>
                    No description provided.
                  </p>
                )}
              </section>

              {/* Attachment */}
              {task.image?.url && (
                <section className='pt-2'>
                  <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>
                    Attachments (1)
                  </h3>
                  <div className='group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
                    <div className='aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden'>
                      <img
                        src={task.image.url}
                        alt='Task attachment'
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                    {/* Overlay */}
                    <div
                      className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4'
                      style={{ bottom: '60px' }}
                    >
                      <button
                        onClick={() => setLightboxOpen(true)}
                        className='p-3 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-colors'
                      >
                        <span className='material-symbols-outlined'>
                          zoom_in
                        </span>
                      </button>
                      <a
                        href={task.image.url}
                        download
                        target='_blank'
                        rel='noreferrer'
                        className='p-3 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-colors'
                      >
                        <span className='material-symbols-outlined'>
                          download
                        </span>
                      </a>
                    </div>
                    <div className='p-4 flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                          task-attachment.png
                        </p>
                        <p className='text-xs text-slate-500'>
                          Uploaded · {formatDate(task.updatedAt)}
                        </p>
                      </div>
                      <a
                        href={task.image.url}
                        download
                        target='_blank'
                        rel='noreferrer'
                        className='text-slate-400 hover:text-primary transition-colors'
                      >
                        <span className='material-symbols-outlined'>
                          download
                        </span>
                      </a>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Column: Activity & Comments ── */}
            <aside className='lg:col-span-4 space-y-6'>
              <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col lg:h-[calc(100vh-12rem)] lg:sticky lg:top-24'>
                {/* Tab header */}
                <div className='flex border-b border-slate-200 dark:border-slate-800 px-4 shrink-0'>
                  <button className='flex-1 py-4 text-sm font-bold border-b-2 border-primary text-primary flex items-center justify-center gap-2'>
                    <span className='material-symbols-outlined text-lg'>
                      chat_bubble
                    </span>
                    Activity &amp; Comments
                  </button>
                </div>

                {/* Scrollable feed */}
                <div className='flex-1 overflow-y-auto p-4 space-y-6 min-h-0'>
                  {/* Static activity from task metadata */}
                  {activityFeed.map((entry, idx) => (
                    <div key={idx} className='flex gap-3'>
                      <div className='flex flex-col items-center'>
                        <div
                          className={`size-8 rounded-full flex items-center justify-center shrink-0 ${entry.iconClass}`}
                        >
                          <span className='material-symbols-outlined text-base'>
                            {entry.icon}
                          </span>
                        </div>
                        {(idx < activityFeed.length - 1 ||
                          comments.length > 0) && (
                          <div className='w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-1' />
                        )}
                      </div>
                      <div className='pb-2 pt-1'>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          {entry.html}
                        </p>
                        <p className='text-xs text-slate-400 mt-1'>
                          {timeAgo(entry.ts)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Dynamic comments */}
                  {comments.map((c, idx) => (
                    <div key={c.id} className='flex gap-3'>
                      <div className='flex flex-col items-center'>
                        <div className='size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
                          {getInitials(c.author)}
                        </div>
                        {idx < comments.length - 1 && (
                          <div className='w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-1' />
                        )}
                      </div>
                      <div className='flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-xs font-bold text-slate-900 dark:text-white'>
                            {c.author}
                          </span>
                          <span className='text-[10px] text-slate-400 uppercase font-bold tracking-wider'>
                            {timeAgo(c.ts)}
                          </span>
                        </div>
                        <p className='text-sm text-slate-600 dark:text-slate-300'>
                          {c.text}
                        </p>
                        <div className='mt-2 flex gap-2'>
                          <button className='text-[10px] font-bold text-slate-400 hover:text-primary transition-colors'>
                            Reply
                          </button>
                          <button className='text-[10px] font-bold text-slate-400 hover:text-primary transition-colors'>
                            Like
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {comments.length === 0 && (
                    <div className='flex flex-col items-center py-4 text-slate-400 gap-2'>
                      <span className='material-symbols-outlined text-3xl'>
                        chat_bubble_outline
                      </span>
                      <p className='text-xs text-center'>
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  )}
                  <div ref={feedEndRef} />
                </div>

                {/* Comment input */}
                <div className='p-4 border-t border-slate-200 dark:border-slate-800 shrink-0'>
                  <div className='relative'>
                    <textarea
                      className='w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 p-3 pb-12 resize-none outline-none transition-shadow'
                      placeholder='Add a comment...'
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
                          handlePost();
                      }}
                    />
                    <div className='absolute bottom-2 left-2 right-2 flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <button className='p-1.5 text-slate-400 hover:text-primary transition-colors'>
                          <span className='material-symbols-outlined text-lg'>
                            format_bold
                          </span>
                        </button>
                        <button className='p-1.5 text-slate-400 hover:text-primary transition-colors'>
                          <span className='material-symbols-outlined text-lg'>
                            alternate_email
                          </span>
                        </button>
                        <button className='p-1.5 text-slate-400 hover:text-primary transition-colors'>
                          <span className='material-symbols-outlined text-lg'>
                            mood
                          </span>
                        </button>
                      </div>
                      <button
                        onClick={handlePost}
                        disabled={!commentText.trim() || posting}
                        className='bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                      >
                        {posting ? 'Posting…' : 'Post'}
                      </button>
                    </div>
                  </div>
                  <p className='text-[10px] text-slate-400 mt-1.5 text-right'>
                    Ctrl+Enter to post
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* ── Mobile action footer ── */}
      {task && (
        <footer className='lg:hidden sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex gap-4 z-30'>
          <button className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2'>
            <span className='material-symbols-outlined'>forum</span>
            Activity
          </button>
          {(role === 'admin' || role === 'manager') && (
            <button
              onClick={() => navigate(`/edit-task/${task._id}`)}
              className='flex-1 bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2'
            >
              <span className='material-symbols-outlined'>edit</span>
              Edit Task
            </button>
          )}
        </footer>
      )}

      {/* Lightbox */}
      {lightboxOpen && task?.image?.url && (
        <Lightbox url={task.image.url} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
};

export default TaskDetail;
