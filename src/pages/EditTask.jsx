import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNavigate, useParams } from 'react-router-dom';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, loading } = useTasks();

  const task = tasks.tasks?.find((t) => t._id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      if (task.image) {
        setImagePreview(task.image?.url);
      }
    }
  }, [task]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    if (image) formData.append('image', image);

    try {
      await updateTask(id, formData);
      navigate('/dashboard');
    } catch (err) {
      alert('Update failed');
    }
  };

  // ('PENDING', 'IN_PROGRESS', 'DONE');

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'DONE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    }
  };

  const getStatusIcon = (currentStatus) => {
    switch (currentStatus) {
      case 'DONE':
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'IN_PROGRESS':
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
              clipRule='evenodd'
            />
          </svg>
        );
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In-Progress' },
    { value: 'DONE', label: 'Completed' },
  ];

  return (
    <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate('/dashboard')}
            className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 flex items-center gap-2 transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Edit Task
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            Update your task details
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
          <form onSubmit={handleSubmit} className='p-8 space-y-6'>
            {/* Title Field */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'
              >
                Task Title
              </label>
              <input
                id='title'
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter task title...'
                className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none'
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'
              >
                Description
              </label>
              <textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter task description...'
                rows={5}
                className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none resize-none'
                required
              />
            </div>

            {/* Status Field */}
            <div>
              <label
                htmlFor='status'
                className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'
              >
                Status
              </label>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all outline-none font-medium text-left flex items-center justify-between ${getStatusColor(status)} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
                >
                  <span className='flex items-center gap-2'>
                    {getStatusIcon(status)}
                    {statusOptions.find((opt) => opt.value === status)?.label ||
                      status}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isStatusOpen && (
                  <div className='absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setStatus(option.value);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-2 transition-colors font-medium ${
                          status === option.value
                            ? getStatusColor(option.value)
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {getStatusIcon(option.value)}
                        {option.label}
                        {status === option.value && (
                          <svg
                            className='w-5 h-5 ml-auto'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload Field */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Task Image
              </label>
              <div className='space-y-4'>
                {/* Image Preview */}
                {imagePreview && (
                  <div className='relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600'>
                    <img
                      src={imagePreview}
                      alt='Task preview'
                      className='w-full h-full object-cover'
                    />
                    {image && (
                      <div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                        New image selected
                      </div>
                    )}
                  </div>
                )}

                {/* File Input */}
                <div className='relative'>
                  <input
                    type='file'
                    id='image'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='hidden'
                  />
                  <label
                    htmlFor='image'
                    className='flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50'
                  >
                    <svg
                      className='w-6 h-6 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {image
                        ? image.name
                        : 'Choose a new image or keep existing'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
              <button
                type='button'
                onClick={() => navigate('/dashboard')}
                className='flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    Update Task
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
