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

const pct = (n, total) => (total === 0 ? 0 : Math.round((n / total) * 100));

// ─── Velocity SVG chart (pure, no lib) ───────────────────────────────────────
function VelocityChart({ dailyData }) {
  const W = 800;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 10, left: 30 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className='flex items-center justify-center h-[260px] text-slate-400 text-sm'>
        No data for the selected period
      </div>
    );
  }

  const maxVal = Math.max(...dailyData.map((d) => d.count), 1);

  // Convert data → SVG points
  const pts = dailyData.map((d, i) => {
    const x = PAD.left + (i / (dailyData.length - 1 || 1)) * innerW;
    const y = PAD.top + innerH - (d.count / maxVal) * innerH;
    return { x, y, ...d };
  });

  // Smooth polyline via catmull-rom → cubic bezier approximation
  const pathD = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${pts[pts.length - 1].x},${PAD.top + innerH} L ${pts[0].x},${PAD.top + innerH} Z`;

  // Y-axis guide lines
  const guides = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: Math.round(f * maxVal),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className='w-full' style={{ height: 260 }}>
      <defs>
        <linearGradient id='vel-grad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#135bec' stopOpacity='0.18' />
          <stop offset='100%' stopColor='#135bec' stopOpacity='0' />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {guides.map((g) => (
        <g key={g.y}>
          <line
            x1={PAD.left}
            y1={g.y}
            x2={W - PAD.right}
            y2={g.y}
            stroke='currentColor'
            strokeOpacity='0.08'
            strokeWidth='1'
          />
          <text
            x={PAD.left - 6}
            y={g.y + 4}
            textAnchor='end'
            fontSize='10'
            fill='currentColor'
            opacity='0.4'
          >
            {g.label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill='url(#vel-grad)' />
      {/* Line */}
      <path
        d={pathD}
        fill='none'
        stroke='#135bec'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      {/* Dots on data points (sparse — every 5th) */}
      {pts
        .filter((_, i) => i % 5 === 0 || i === pts.length - 1)
        .map((pt) => (
          <circle
            key={pt.x}
            cx={pt.x}
            cy={pt.y}
            r='4'
            fill='white'
            stroke='#135bec'
            strokeWidth='2'
          />
        ))}
    </svg>
  );
}

// ─── Donut ring (pure SVG) ────────────────────────────────────────────────────
function DonutChart({ done, inProgress, pending }) {
  const total = done + inProgress + pending || 1;
  const r = 70;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * r;

  // Slices: done (primary), inProgress (indigo), pending (slate)
  const slices = [
    { value: done, color: '#135bec' },
    { value: inProgress, color: '#6366f1' },
    { value: pending, color: '#cbd5e1' },
  ];

  let offset = 0;
  const arcs = slices.map((s) => {
    const dash = (s.value / total) * circumference;
    const gap = circumference - dash;
    const el = (
      <circle
        key={s.color}
        cx={cx}
        cy={cy}
        r={r}
        fill='none'
        stroke={s.color}
        strokeWidth='22'
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg viewBox='0 0 200 200' className='size-48'>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill='none'
        stroke='#e2e8f0'
        strokeWidth='22'
      />
      {arcs}
      <text
        x={cx}
        y={cy - 8}
        textAnchor='middle'
        fontSize='22'
        fontWeight='900'
        fill='currentColor'
      >
        {done}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor='middle'
        fontSize='9'
        fontWeight='700'
        fill='#94a3b8'
        letterSpacing='0.05em'
      >
        COMPLETED
      </text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Analytics = () => {
  const navigate = useNavigate();
  const {
    user: { name, role },
    logout,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(30); // days

  // Computed analytics
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    inProgress: 0,
    pending: 0,
    efficiencyRate: 0,
  });
  const [dailyVelocity, setDailyVelocity] = useState([]); // [{day, count}]
  const [topPerformers, setTopPerformers] = useState([]); // [{name, done, total, eff}]
  const [insight, setInsight] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tasks/all', {
        params: { limit: 9999, page: 1 },
      });
      const all = data.tasks ?? [];

      // ── Basic counts ──
      const done = all.filter((t) => t.status === 'DONE').length;
      const inProgress = all.filter((t) => t.status === 'IN_PROGRESS').length;
      const pending = all.filter((t) => t.status === 'PENDING').length;
      const efficiencyRate = pct(done, all.length);

      setStats({
        total: all.length,
        done,
        inProgress,
        pending,
        efficiencyRate,
      });

      // ── Daily velocity (tasks created/updated to DONE per day, last N days) ──
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - period);

      // Build map: dateString → completedCount
      const dayMap = {};
      for (let i = 0; i < period; i++) {
        const d = new Date(cutoff);
        d.setDate(d.getDate() + i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }

      all
        .filter((t) => t.status === 'DONE' && t.updatedAt)
        .forEach((t) => {
          const day = t.updatedAt.slice(0, 10);
          if (day in dayMap) dayMap[day]++;
        });

      const velocity = Object.entries(dayMap).map(([day, count]) => ({
        day,
        count,
      }));
      setDailyVelocity(velocity);

      // ── Top performers: group DONE tasks by assignedTo ──
      const perfMap = {};
      all.forEach((t) => {
        const uid =
          typeof t.assignedTo === 'object' && t.assignedTo
            ? t.assignedTo._id
            : null;
        const uname =
          typeof t.assignedTo === 'object' && t.assignedTo
            ? t.assignedTo.name
            : null;
        if (!uid || !uname) return;
        if (!perfMap[uid]) perfMap[uid] = { name: uname, done: 0, total: 0 };
        perfMap[uid].total++;
        if (t.status === 'DONE') perfMap[uid].done++;
      });

      const performers = Object.values(perfMap)
        .map((p) => ({ ...p, eff: pct(p.done, p.total) }))
        .sort((a, b) => b.done - a.done)
        .slice(0, 5);
      setTopPerformers(performers);

      // ── Smart insight: find day-of-week with most completions ──
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dowCount = new Array(7).fill(0);
      all
        .filter((t) => t.status === 'DONE' && t.updatedAt)
        .forEach((t) => {
          const dow = new Date(t.updatedAt).getDay();
          dowCount[dow]++;
        });
      const peakDow = dowCount.indexOf(Math.max(...dowCount));
      if (all.length > 0) {
        setInsight(
          `Your team tends to complete the most tasks on ${dayNames[peakDow]}s. Consider scheduling focused work sessions on that day to maximise velocity.`,
        );
      } else {
        setInsight(
          'Complete some tasks to see personalised productivity insights here.',
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ─── period label map ───────────────────────────────────────────────────────
  const PERIODS = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
  ];

  // X-axis labels
  const xLabels = [
    `Day 1`,
    `Day ${Math.floor(period / 4)}`,
    `Day ${Math.floor(period / 2)}`,
    `Day ${Math.floor((3 * period) / 4)}`,
    `Day ${period}`,
  ];

  return (
    <div className='min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
      <ThemeToggle />

      {/* ── Top nav header ── */}
      <header className='flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-20'>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-3 text-primary'>
            <div className='size-7 bg-primary rounded flex items-center justify-center text-white'>
              <span className='material-symbols-outlined text-sm'>
                analytics
              </span>
            </div>
            <h2 className='text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight'>
              TaskInsights
            </h2>
          </div>
        </div>

        <nav className='hidden lg:flex items-center gap-9'>
          <Link
            to='/dashboard'
            className='text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium'
          >
            Dashboard
          </Link>
          {(role === 'admin' || role === 'manager') && (
            <Link
              to='/team-tasks'
              className='text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium'
            >
              Tasks
            </Link>
          )}
          {(role === 'admin' || role === 'manager') && (
            <Link
              to='/manager-dashboard'
              className='text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium'
            >
              Projects
            </Link>
          )}
          <span className='text-primary text-sm font-bold border-b-2 border-primary pb-1'>
            Insights
          </span>
          {(role === 'admin' || role === 'manager') && (
            <Link
              to='/teams'
              className='text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium'
            >
              Team
            </Link>
          )}
        </nav>

        <div className='flex items-center gap-3'>
          <button className='flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'>
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <button
            onClick={logout}
            className='flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
            title='Logout'
          >
            <span className='material-symbols-outlined'>logout</span>
          </button>
          <div className='size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm'>
            {getInitials(name)}
          </div>
        </div>
      </header>

      <main className='flex-1 px-4 md:px-10 lg:px-24 xl:px-40 py-10'>
        {/* Page heading */}
        <div className='flex flex-wrap justify-between items-end gap-4 mb-10'>
          <div>
            <h1 className='text-4xl font-black leading-tight tracking-tight'>
              Analytics Dashboard
            </h1>
            <p className='text-slate-500 dark:text-slate-400 text-base mt-1'>
              Real-time productivity insights for{' '}
              {role === 'admin' ? 'all teams' : 'your team'}
            </p>
          </div>
          <div className='flex gap-3'>
            {/* Period selector */}
            <div className='flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700'>
              {PERIODS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setPeriod(p.days)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    period === p.days
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {(role === 'admin' || role === 'manager') && (
              <button
                onClick={() => navigate('/team-tasks')}
                className='flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20'
              >
                <span className='material-symbols-outlined text-sm'>
                  download
                </span>
                <span>View Tasks</span>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className='mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium'>
            {error}
          </div>
        )}

        {/* ── KPI cards ── */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
          {/* Total Tasks */}
          <div className='flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-center mb-1'>
              <p className='text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>
                Total Tasks
              </p>
              <div className='size-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center'>
                <span className='material-symbols-outlined text-lg'>
                  list_alt
                </span>
              </div>
            </div>
            <div className='flex items-end gap-3'>
              {loading ? (
                <div className='h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse' />
              ) : (
                <p className='text-3xl font-bold leading-none tracking-tight'>
                  {stats.total.toLocaleString()}
                </p>
              )}
            </div>
            <p className='text-slate-400 text-xs mt-1'>
              {stats.pending} pending · {stats.inProgress} in progress
            </p>
          </div>

          {/* Completed */}
          <div className='flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-center mb-1'>
              <p className='text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>
                Completed
              </p>
              <div className='size-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center'>
                <span className='material-symbols-outlined text-lg'>
                  check_circle
                </span>
              </div>
            </div>
            <div className='flex items-end gap-3'>
              {loading ? (
                <div className='h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse' />
              ) : (
                <>
                  <p className='text-3xl font-bold leading-none tracking-tight'>
                    {stats.done.toLocaleString()}
                  </p>
                  {stats.total > 0 && (
                    <span className='flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-xs font-bold mb-1'>
                      {pct(stats.done, stats.total)}%
                    </span>
                  )}
                </>
              )}
            </div>
            <p className='text-slate-400 text-xs mt-1'>
              {pct(stats.done, stats.total)}% completion rate
            </p>
          </div>

          {/* Efficiency */}
          <div className='flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-center mb-1'>
              <p className='text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>
                Efficiency Rate
              </p>
              <div className='size-8 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center'>
                <span className='material-symbols-outlined text-lg'>bolt</span>
              </div>
            </div>
            <div className='flex items-end gap-3'>
              {loading ? (
                <div className='h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse' />
              ) : (
                <>
                  <p className='text-3xl font-bold leading-none tracking-tight'>
                    {stats.efficiencyRate}%
                  </p>
                  <span
                    className={`flex items-center px-2 py-0.5 rounded text-xs font-bold mb-1 ${
                      stats.efficiencyRate >= 70
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                    }`}
                  >
                    <span className='material-symbols-outlined text-xs mr-0.5'>
                      {stats.efficiencyRate >= 70
                        ? 'trending_up'
                        : 'trending_down'}
                    </span>
                    {stats.efficiencyRate >= 70 ? 'On track' : 'Needs review'}
                  </span>
                </>
              )}
            </div>
            <p className='text-slate-400 text-xs mt-1'>
              Based on tasks completed vs assigned
            </p>
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Velocity chart */}
          <div className='lg:col-span-2 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <h3 className='text-lg font-bold'>Task Completion Velocity</h3>
                <p className='text-slate-500 dark:text-slate-400 text-sm'>
                  Daily completed tasks over the last {period} days
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5'>
                  <div className='size-2.5 rounded-full bg-primary' />
                  <span className='text-xs text-slate-500 font-medium'>
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className='flex items-center justify-center h-[260px]'>
                <div className='w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin' />
              </div>
            ) : (
              <VelocityChart dailyData={dailyVelocity} />
            )}

            <div className='flex justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2'>
              {xLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className='flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm'>
            <div>
              <h3 className='text-lg font-bold'>Task Distribution</h3>
              <p className='text-slate-500 dark:text-slate-400 text-sm'>
                Status breakdown
              </p>
            </div>
            <div className='flex flex-col items-center justify-center grow py-2'>
              {loading ? (
                <div className='size-48 rounded-full border-[22px] border-slate-200 dark:border-slate-700 animate-pulse' />
              ) : (
                <DonutChart
                  done={stats.done}
                  inProgress={stats.inProgress}
                  pending={stats.pending}
                />
              )}
            </div>
            <div className='space-y-4'>
              {[
                {
                  dot: 'bg-primary',
                  label: 'Completed',
                  count: stats.done,
                },
                {
                  dot: 'bg-indigo-500',
                  label: 'In Progress',
                  count: stats.inProgress,
                },
                {
                  dot: 'bg-slate-300 dark:bg-slate-600',
                  label: 'Pending',
                  count: stats.pending,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <div className={`size-3 rounded-full ${s.dot}`} />
                    <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      {s.label}
                    </span>
                  </div>
                  <span className='text-sm font-bold'>
                    {loading
                      ? '…'
                      : `${s.count} (${pct(s.count, stats.total)}%)`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Top performers */}
          <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm'>
            <h3 className='text-lg font-bold mb-5'>Top Performers</h3>
            {loading ? (
              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between animate-pulse'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='size-10 rounded-full bg-slate-200 dark:bg-slate-700' />
                      <div>
                        <div className='h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-1.5' />
                        <div className='h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded' />
                      </div>
                    </div>
                    <div>
                      <div className='h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1.5' />
                      <div className='h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded' />
                    </div>
                  </div>
                ))}
              </div>
            ) : topPerformers.length === 0 ? (
              <div className='flex flex-col items-center py-8 text-slate-400'>
                <span className='material-symbols-outlined text-4xl mb-2'>
                  emoji_events
                </span>
                <p className='text-sm'>
                  No completed tasks yet — be the first!
                </p>
              </div>
            ) : (
              <div className='space-y-5'>
                {topPerformers.map((p, idx) => (
                  <div
                    key={p.name}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <div className='size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm'>
                          {getInitials(p.name)}
                        </div>
                        {idx === 0 && (
                          <span className='absolute -top-1 -right-1 size-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px]'>
                            🥇
                          </span>
                        )}
                      </div>
                      <div>
                        <p className='text-sm font-bold'>{p.name}</p>
                        <p className='text-xs text-slate-500'>
                          {p.total} assigned
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-primary'>
                        {p.done} Done
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          p.eff >= 80
                            ? 'text-emerald-600'
                            : p.eff >= 50
                              ? 'text-amber-600'
                              : 'text-rose-500'
                        }`}
                      >
                        {p.eff}% efficient
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart insight */}
          <div className='bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6 flex flex-col justify-center items-center text-center'>
            <div className='size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4'>
              <span className='material-symbols-outlined text-3xl'>
                lightbulb
              </span>
            </div>
            <h3 className='text-lg font-bold mb-2'>Smart Insight</h3>
            {loading ? (
              <div className='space-y-2 w-full max-w-xs'>
                <div className='h-3 bg-primary/10 rounded animate-pulse' />
                <div className='h-3 bg-primary/10 rounded animate-pulse w-4/5 mx-auto' />
                <div className='h-3 bg-primary/10 rounded animate-pulse w-3/5 mx-auto' />
              </div>
            ) : (
              <p className='text-slate-600 dark:text-slate-400 text-sm max-w-sm mb-6'>
                {insight}
              </p>
            )}
            {(role === 'admin' || role === 'manager') && (
              <button
                onClick={() => navigate('/team-tasks')}
                className='text-primary font-bold text-sm flex items-center gap-1 hover:underline transition-all'
              >
                View full task list{' '}
                <span className='material-symbols-outlined text-sm'>
                  chevron_right
                </span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
