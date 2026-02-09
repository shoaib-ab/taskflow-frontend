import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTasks } from '../context/TaskContext';
import FullScreenLoader from '../components/FullScreenLoader';

const CreateTask = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const { addTask, loading: contextLoading } = useTasks();

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
    if (image) {
      formData.append('image', image);
    }

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
    navigate('/dashboard');
  };

  return (
    <div>
      {contextLoading && <FullScreenLoader />}
      <div className='bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-gray-100 font-display transition-colors duration-200 min-h-screen flex flex-col'>
        <ThemeToggle />

        {/* Top Navigation Bar */}
        <header className='sticky top-0 z-50 w-full border-b border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#161e2d] px-4 md:px-10 py-3'>
          <div className='mx-auto flex max-w-[1200px] items-center justify-between'>
            <div className='flex items-center gap-8'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white'>
                  <span className='material-symbols-outlined text-xl'>
                    grid_view
                  </span>
                </div>
                <h2 className='text-lg font-bold leading-tight tracking-tight'>
                  TaskMaster
                </h2>
              </div>
              <nav className='hidden md:flex items-center gap-8'>
                <Link
                  className='text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors'
                  to='/dashboard'
                >
                  Dashboard
                </Link>
                <Link className='text-sm font-medium text-primary' to='#'>
                  Projects
                </Link>
                <Link
                  className='text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors'
                  to='#'
                >
                  Teams
                </Link>
                <Link
                  className='text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors'
                  to='#'
                >
                  Reports
                </Link>
              </nav>
            </div>
            <div className='flex items-center gap-4'>
              <div className='hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5'>
                <span className='material-symbols-outlined text-gray-400 text-sm mr-2'>
                  search
                </span>
                <input
                  className='bg-transparent border-none focus:ring-0 text-sm w-40 placeholder:text-gray-400'
                  placeholder='Search tasks...'
                  type='text'
                />
              </div>
              <div
                className='h-8 w-8 rounded-full bg-cover bg-center ring-2 ring-gray-100 dark:ring-gray-800'
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqnRphzOg7VxITIskCGBjq8mM72oNfIxLMB9Ke3lfsj_zjXs0QWWOdxqrkZclubsX7mYjmfbDsnJJOvufGFxA3JAra5OVIDmy1dpxCIChD4k9gDoeUvFBz_2hlw6CGOvszj3hhfwWvDN5WOY2b4h0_wmKTpgJHEHDSaJZ71TOb_BjhkRu74SKycDpnahvc1i06XgRAYokWlHGzWA7HAKMCwaY_RdxGq-tiYQx9VvSRtCeWphinSAZG5m0H1A3LvACvmY6AXXjIPZc')",
                }}
              ></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 flex flex-col items-center py-8 px-4'>
          <div className='w-full max-w-[800px]'>
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
