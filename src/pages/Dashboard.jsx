import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const tasks = [
    {
      id: 1,
      title: 'Develop API Integration',
      description:
        'MERN stack integration with third-party providers for seamless payment processing.',
      status: 'In Progress',
      statusColor: 'primary',
      due: 'Due in 2 days',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBO_eurYcFomQJcn4mETS-2_5uhhVBC7fJT0Mc02dsm_KPM-pS7G38DRwl1iRcsFM8eEY8DjFn76Dqvczq6A6g0nQ4jT5aWLvvLo1s7UBnUndnoz2IRGJyH0oeVh90dX4uxKRsLV7wQh3mxkTHXhnJt0_vY3KlSQf1Lp-5SRXJ0SCxAY5qboVoY1viAGYYwQCsUV8OTL5eYum6nRwobkkiubB_s3ebQMOQkNpaNwti1yzHca0JXN8y_5_g8DCmwoBFxaxwIEtUKjVQ',
    },
    {
      id: 2,
      title: 'UI/UX Audit',
      description:
        'Reviewing design consistency across all dashboard modules and reporting feedback.',
      status: 'Completed',
      statusColor: 'emerald',
      due: 'Finished',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCq_Kng_s_WJwkOluk6E9jKNRYl91y3OdOn_HzIdAvV7bu8zjeqjk2saCeg2eLaBlgV10LGFwZBOR8T7T6BrokfzAmDAVnpyxXuIdvXDxT2ScqOh5NddCPIpUdQv_L0_ybPbs3IlaUTjGGEDNPPzmrKjMf4g0i5kmarx4j27Hw_m1trVkkCw7RXDp-7BsPe2cQF6n4Y53tdb9F2-dDK_4K_C5zVQ_lBVxfzNtN-WwUPji8dX4p_xZ_TD7bxI5QotlGGIJnZdL4J6dk',
    },
    {
      id: 3,
      title: 'Database Migration',
      description:
        'Scaling PostgreSQL clusters for high availability and zero-downtime performance.',
      status: 'Pending',
      statusColor: 'amber',
      due: 'Starts tomorrow',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC0p3q6JY7NiCKKRn5jVrJ5jhxH9pvwh4CC067aIPh0frEAMobPqMWhbIrSr3mRy97VOStAyk6VAYeK_bkt3HnJhdLXRhaFcJ2szhwg9Xqe6aDvcTeJFKwSWAXZ282KAQ1WnjELP_iECgSlfEEt0IReVaQ04bJkHqlCmeBTdiHEn6W_3950fyB9Hx_46Mk0MM7KZHyeHjzJxmEkGhD0o35fd57OEHnuA7Jq7hqGFSWZSxHXmtD_pZDOsVwmxcgEu8v9_UklC6BQEJU',
    },
    {
      id: 4,
      title: 'Mobile App Refactor',
      description:
        'Optimizing React Native components for better scroll performance and rendering.',
      status: 'In Progress',
      statusColor: 'primary',
      due: 'Due in 5 days',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDLgoJKTv22Ed1t-OEw6ABDQ0Tc6xMLkOVV2f7YgBPgDmeDHqmqKzuvEGgdrjWJXNg7wwxI4CIogiat1on1_A_LuBMXU6rRcFh-pm4TOAQ1U7KcepQE8PBS1YSmngH0rQOjTeSoe3r8aPS4u_ZkiBl_wYFPe9ttGUQljEPCv9PIhxwMHn1Hlf8iFTl0DT24K8ut6U9uM6A7-ievfL81gATWy5MmB4dScjh8-mWrBo8W4W4yv88JM1N67UcpdILUXc8Ht7BN5xbUh0o',
    },
    {
      id: 5,
      title: 'Client Meeting Prep',
      description:
        'Gathering requirements for Q3 feature roadmap and investor presentations.',
      status: 'Pending',
      statusColor: 'amber',
      due: 'Sept 24',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDoqkGF4gjEFCFB_Qj_2FKQQYZ7pNgeUJSyC-G5LoOzyo_snnQ0suQAyUWTFHy50jYpfaVF9svxHdEhfLeN4oWAlABp9BWbrlnD3-mfUHKq84AGS1cFxQctQdcgSVOg7i50ZibemMaiMIEN0fSDnBzV8bdqBRRDwlOj8euhdN0Q56tIMNM7rpQSXvkxRGqRKMRXBMkmsDTB9HG2oQTqa5KtaZiCP-dy35r2ync1XqeQ-PNz5YaLS9uUW_6EELjY1WE7ozaetq9Lnl8',
    },
    {
      id: 6,
      title: 'Security Patch',
      description:
        'Implementing OAuth2.0 fixes for authentication service and revoking stale keys.',
      status: 'Completed',
      statusColor: 'emerald',
      due: 'Finished',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuADEDOXqdKJnqBcAO0UYcvOk_85AXeQlTWzTJrZrA22fI_jUCQFA8jWYdUuVconBNKFKXoHHR7AqNx23Nz0jm-lH5DEAopDbmtLvAtH7GpA3IBODDGNbiBpoQa_5VFNLsDUrNPoeP2sGknEfJEiXhHqlDZzHapu6IBalCQNgSTfg4PEzCEI63zbj5jigL3_rmsewLX2G3tmgKkZdzHIW0_PK-3YAXMpU39bF7Y8KLxow-VhvvIVrQGnf-HKEYrFp4lQ_6JmCz7EZaI',
    },
  ];

  const {
    user: { name, email },
    logout,
  } = useAuth();

  return (
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
              <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'>
                search
              </span>
              <input
                className='w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all dark:text-white placeholder:text-slate-400'
                placeholder='Search tasks, projects, or team members...'
                type='text'
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

          {/* Filters */}
          <div className='flex flex-wrap items-center gap-3 mb-8'>
            {['Priority', 'Due Date', 'Assignee'].map((filter, idx) => (
              <button
                key={filter}
                className='flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors'
              >
                <span className='material-symbols-outlined text-lg'>
                  {['filter_alt', 'calendar_today', 'person'][idx]}
                </span>
                <span>{filter}</span>
                <span className='material-symbols-outlined text-lg text-slate-400'>
                  expand_more
                </span>
              </button>
            ))}
            <div className='h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1'></div>
            <button className='flex items-center gap-2 px-3 py-1.5 text-primary text-sm font-bold hover:underline'>
              <span>Clear All Filters</span>
            </button>
          </div>

          {/* Task Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10'>
            {tasks.map((task) => (
              <div
                key={task.id}
                className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all group'
              >
                <div
                  className={`h-32 ${task.statusColor === 'primary' ? 'bg-primary/10' : task.statusColor === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'} relative overflow-hidden`}
                >
                  {task.statusColor === 'primary' && (
                    <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent'></div>
                  )}
                  <img
                    alt={task.title}
                    className='w-full h-full object-cover opacity-80'
                    src={task.image}
                  />
                  <div className='absolute top-3 left-3'>
                    <span
                      className={`${task.statusColor === 'primary' ? 'bg-primary/20 text-primary border-primary/20' : task.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50'} text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border backdrop-blur-md`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2'>
                    <button className='p-1.5 bg-white rounded-lg shadow-sm hover:text-primary transition-colors'>
                      <span className='material-symbols-outlined text-base'>
                        edit
                      </span>
                    </button>
                    <button className='p-1.5 bg-white rounded-lg shadow-sm hover:text-red-500 transition-colors'>
                      <span className='material-symbols-outlined text-base'>
                        delete
                      </span>
                    </button>
                  </div>
                </div>
                <div className='p-5'>
                  <h3 className='font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug'>
                    {task.title}
                  </h3>
                  <p className='text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2'>
                    {task.description}
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
                      className={`flex items-center gap-1.5 ${task.status === 'Completed' ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}
                    >
                      <span className='material-symbols-outlined text-sm'>
                        {task.status === 'Completed'
                          ? 'check_circle'
                          : task.status === 'Pending'
                            ? 'history'
                            : 'schedule'}
                      </span>
                      <span className='text-xs font-medium'>{task.due}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 pb-12'>
            <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
              Showing 6 of 42 tasks
            </p>
            <div className='flex items-center gap-2'>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors'>
                <span className='material-symbols-outlined'>chevron_left</span>
              </button>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm'>
                1
              </button>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors'>
                2
              </button>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors'>
                3
              </button>
              <span className='px-1 text-slate-400'>...</span>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors'>
                7
              </button>
              <button className='w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors'>
                <span className='material-symbols-outlined'>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
