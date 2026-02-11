import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useEffect, useState } from 'react';
import FullScreenLoader from './../components/FullScreenLoader';

const Dashboard = () => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  const navigate = useNavigate();

  const {
    user: { name, email },
    logout,
  } = useAuth();

  const { meta, tasks, getTasks, loading, deleteTask } = useTasks();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getTasks({
        page,
        limit: limit,
        search: debouncedSearch,
        status: statusFilter,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [page, statusFilter, debouncedSearch]);

  console.log('Tasks in Dashboard:', tasks);

  let taskData = tasks.tasks || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  return (
    <div>
      {loading && <FullScreenLoader />}

      <div className='flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300'>
        <ThemeToggle />

        {/* Sidebar Navigation */}
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
            <a
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors'
              href='#'
            >
              <span className='material-symbols-outlined'>dashboard</span>
              <span>All Tasks</span>
            </a>
            {['schedule', 'trending_up', 'check_circle'].map((icon, idx) => (
              <a
                key={icon}
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
                href='#'
              >
                <span className='material-symbols-outlined'>{icon}</span>
                <span>{['Pending', 'In-Progress', 'Completed'][idx]}</span>
              </a>
            ))}

            <div className='pt-8 pb-2'>
              <p className='px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                Teams
              </p>
            </div>
            {['groups', 'palette'].map((icon, idx) => (
              <a
                key={icon}
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
                href='#'
              >
                <span className='material-symbols-outlined'>{icon}</span>
                <span>{['Engineering', 'Design Team'][idx]}</span>
              </a>
            ))}
            <a
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors'
              href='#'
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

        {/* Main Content Area */}
        <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
          {/* Global Header */}
          <header className='h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101622] flex items-center justify-between px-8 shrink-0'>
            <div className='flex-1 max-w-xl'>
              <div className='relative group'>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search tasks...'
                  className='border-0 outline-none bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-5 pr-4 w-full focus:ring-2 focus:ring-primary/50 transition-colors'
                />
              </div>
            </div>

            <div className='flex items-center gap-4 ml-8'>
              <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative'>
                <span className='material-symbols-outlined'>notifications</span>
                <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800'></span>
              </button>
              <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg'>
                <span className='material-symbols-outlined'>settings</span>
              </button>
              <div className='h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1'></div>
              <div className='flex items-center gap-3 pl-2'>
                <div className='text-right hidden sm:block'>
                  <p className='text-sm font-semibold text-slate-900 dark:text-white leading-none'>
                    {name}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    {email}
                  </p>
                </div>
                <img
                  alt='User Profile'
                  className='w-9 h-9 rounded-full bg-slate-200 border border-slate-200 dark:border-slate-700'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuAc-zDMdc2kI8Ud_6lySbPJcyNlbKZFMrrW78lWFONLDn30-Eqf9FkWaAMWOGwnKtGmSTnP5NB4PdQ928cb3G4scF_n6_hK73fjw4I7JlJ7VPEex65klr5gZhVylFhn9sjnNld22PHjIJA7hA0NE4vUfHxMzgnyjactQcco_iuZVeAc4Ts1uRriC6yb1pNDvHYpIPPrjUd7dIXfSWaEjFe10IV4QXrlbv5G5CXfSppWuY6uxRByY7yNu0am6gPw2iRv8MUqzZxaZoc'
                />
                <span className='material-symbols-outlined text-slate-400 text-sm cursor-pointer'>
                  expand_more
                </span>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className='flex-1 overflow-y-auto p-8'>
            {/* Action Bar */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
              <div>
                <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tight'>
                  My Tasks
                </h2>
                <p className='text-slate-500 mt-1'>
                  You have 12 tasks in progress this week.
                </p>
              </div>
              <button
                onClick={() => navigate('/create-task')}
                className='bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20'
              >
                <span className='material-symbols-outlined'>add</span>
                <span>Create Task</span>
              </button>
            </div>

            {/* Status Filters */}
            <div className='flex flex-wrap items-center gap-3 mb-8'>
              {[
                { label: 'All', value: '' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'DONE' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setStatusFilter(item.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors
        ${
          statusFilter === item.value
            ? 'bg-primary text-white'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Task Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10'>
              {taskData.map(
                ({ title, description, status, _id: id, image }) => (
                  <div
                    key={id}
                    className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all group'
                  >
                    <div
                      className={`h-32 ${status === 'Completed' ? 'bg-emerald-500/10' : status === 'Pending' ? 'bg-amber-500/10' : 'bg-primary/10'} relative overflow-hidden`}
                    >
                      {status === 'Completed' && (
                        <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent'></div>
                      )}
                      <img
                        alt={title}
                        className='w-full h-full object-cover opacity-80'
                        src={image?.url}
                      />
                      <div className='absolute top-3 left-3'>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'DONE' ? 'bg-emerald-500/20 text-emerald-500' : status === 'PENDING' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className='absolute top-3 right-3 opacity-0  group-hover:opacity-100 transition-opacity flex gap-2'>
                        <button
                          onClick={() => navigate(`/edit-task/${id}`)}
                          className='p-1.5 bg-white rounded-lg shadow-sm 
                          group-hover:bg-white dark:group-hover:bg-slate-700
                          hover:text-primary transition-colors'
                        >
                          <span className='material-symbols-outlined text-base'>
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className='p-1.5 bg-white 
                          group-hover:bg-white dark:group-hover:bg-slate-700
                          rounded-lg shadow-sm hover:text-red-500 transition-colors'
                        >
                          <span className='material-symbols-outlined text-base'>
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className='p-5'>
                      <h3 className='font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug'>
                        {title}
                      </h3>
                      <p className='text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2'>
                        {description}
                      </p>
                      <div className='mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between'>
                        <div className='flex -space-x-2'>
                          <img
                            className='w-6 h-6 rounded-full border-2 border-white dark:border-slate-800'
                            src='https://lh3.googleusercontent.com/aida-public/AB6AXuAM8NOZrsrur6rITeaZ4RaLTrUyww0jcmCh_KSGjD20Upi3QIlTe8TsxkIkmXFaiShTr1OcgbYGde87aPRg-ZYbOFoVMFumbwaYzRAMMepRhp6leK1zqPHI4ZHobiyNg0swR4GzkaRewaYzAXsbAV__cR-g0G02_mYKmw6QYL7kIYS_Q9YwO4gMl_UizUWFBEy3uh3JTFBVslSh6R1S7OLTolL9BCXnXwjUGmPyXdLfUK_IHAwRpZJuDcd8xVn61MiuCoJBrIWR4fw'
                            alt='User'
                          />
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${status === 'Completed' ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}
                        >
                          <span className='material-symbols-outlined text-sm'>
                            {status === 'Completed'
                              ? 'check_circle'
                              : status === 'Pending'
                                ? 'history'
                                : 'schedule'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 pb-12'>
              <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
                Showing {(page - 1) * meta.limit + 1} –
                {Math.min(page * meta.limit, meta.totalTasks)} of{' '}
                {meta.totalTasks} tasks
              </p>

              <div className='flex items-center gap-2'>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-50'
                >
                  <span className='material-symbols-outlined'>
                    chevron_left
                  </span>
                </button>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold
          ${
            page === p
              ? 'bg-primary text-white'
              : 'border border-slate-200 dark:border-slate-700'
          }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-50'
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

export default Dashboard;
