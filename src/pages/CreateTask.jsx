import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const { addTask, loading: contextLoading } = useTasks();

  // Manager-only fields
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // Fetch manager's teams
  useEffect(() => {
    if (!isManager) return;
    api
      .get('/teams')
      .then((res) => setTeams(res.data.teams ?? []))
      .catch(() => {});
  }, [isManager]);

  const selectedTeam = teams.find((t) => t._id === selectedTeamId);
  const teamMembers = selectedTeam?.members ?? [];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePreviewClose = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || contextLoading) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);
    if (isManager && selectedTeamId) formData.append('teamId', selectedTeamId);
    if (isManager && assignedTo) formData.append('assignedTo', assignedTo);
    if (priority) formData.append('priority', priority);
    if (dueDate) formData.append('dueDate', dueDate);

    try {
      await addTask(formData);
      setTitle('');
      setDescription('');
      setImage(null);
      setPreview(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }

    console.log('Task Created:');
    const redirectTo =
      user?.role === 'manager'
        ? '/manager-dashboard'
        : user?.role === 'admin'
          ? '/admin'
          : '/dashboard';
    navigate(redirectTo);
  };

  return (
    <div>
      {contextLoading && <FullScreenLoader />}
      <div className='bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-gray-100 font-display transition-colors duration-200 flex h-screen overflow-hidden'>
        <ThemeToggle />
        <Sidebar />

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto py-8 px-8'>
          <div className='w-full max-w-[800px] mx-auto'>
            {/* Breadcrumbs */}
            <nav className='flex items-center gap-2 mb-6 text-sm'>
              <Link
                className='text-gray-500 hover:text-primary'
                to='/dashboard'
              >
                Dashboard
              </Link>
              <span className='material-symbols-outlined text-xs text-gray-400'>
                chevron_right
              </span>
              <Link
                className='text-gray-500 hover:text-primary'
                to='/dashboard'
              >
                All Tasks
              </Link>
              <span className='material-symbols-outlined text-xs text-gray-400'>
                chevron_right
              </span>
              <span className='font-semibold text-primary'>New Task</span>
            </nav>

            {/* Page Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-black text-gray-900 dark:text-white mb-2'>
                Create New Task
              </h1>
              <p className='text-gray-500 dark:text-gray-400'>
                Fill in the technical details to initiate a new sprint item.
              </p>
            </div>

            {/* Form Container */}
            <div className='bg-white dark:bg-[#1a2333] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden'>
              <form onSubmit={handleSubmit} className='p-6 md:p-8 space-y-8'>
                {/* Task Title */}
                <div className='space-y-2'>
                  <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Task Title
                  </label>
                  <input
                    name='title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
                    placeholder='e.g., Implement OAuth2.0 with Passport.js'
                    type='text'
                    required
                  />
                  <p className='text-xs text-gray-400'>
                    Be descriptive but concise.
                  </p>
                </div>

                {/* ── Manager-only: Team & Assign To ── */}
                {isManager && (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    {/* Team */}
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Team
                      </label>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => {
                          setSelectedTeamId(e.target.value);
                          setAssignedTo('');
                        }}
                        className='w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
                      >
                        <option value=''>-- No team (personal) --</option>
                        {teams.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assign To */}
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Assign To
                      </label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        disabled={!selectedTeamId}
                        className='w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <option value=''>-- Assign to yourself --</option>
                        {teamMembers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.email})
                          </option>
                        ))}
                      </select>
                      {!selectedTeamId && (
                        <p className='text-xs text-gray-400'>
                          Select a team first to see members.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority & Due Date (all roles) */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  {/* Priority */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className='w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Due Date
                    </label>
                    <input
                      type='date'
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className='w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
                    />
                  </div>
                </div>

                {/* Description & Status Grid */}
                <div className='grid grid-cols-1 gap-8'>
                  {/* Description */}
                  <div className='md:col-span-2 space-y-2'>
                    <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Description
                    </label>
                    <textarea
                      name='description'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className='w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none'
                      placeholder='Break down the technical requirements and acceptance criteria...'
                      rows='6'
                      required
                    ></textarea>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className='space-y-4'>
                  <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Upload Task Image
                  </label>
                  <div className='relative group cursor-pointer'>
                    <div className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:border-primary/50 hover:bg-primary/5 transition-all'>
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <span className='material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary mb-2 transition-colors'>
                          cloud_upload
                        </span>
                        <p className='mb-1 text-sm text-gray-600 dark:text-gray-400'>
                          <span className='font-semibold'>Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-500'>
                          PNG, JPG or WEBP (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        type='file'
                        accept='image/*'
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  {preview && (
                    <div className='flex flex-wrap gap-4 pt-2'>
                      <div className='relative group size-20 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm'>
                        <img
                          src={preview}
                          alt='Preview'
                          className='object-cover w-20 h-20'
                        />
                        <button
                          type='button'
                          onClick={handlePreviewClose}
                          className='absolute top-1 right-1 bg-white/80 dark:bg-black/80 p-0.5 rounded-full text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <span className='material-symbols-outlined text-sm'>
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className='pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className='px-6 h-11 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
                    type='button'
                  >
                    Cancel
                  </button>
                  <button
                    className='px-8 h-11 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2'
                    type='submit'
                  >
                    <span className='material-symbols-outlined text-sm'>
                      save
                    </span>
                    Save Task
                  </button>
                </div>
              </form>
            </div>

            {/* Technical Footer Info */}
            <div className='mt-8 flex justify-between items-center text-xs text-gray-400 px-2'>
              <p>MERN Stack Instance: v2.4.0</p>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-green-500'></span>{' '}
                  API Online
                </span>
                <span>Auto-saving draft...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTask;
