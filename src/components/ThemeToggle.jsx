import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className='fixed top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-[#1a212f] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all duration-300 flex items-center justify-center'
      aria-label='Toggle theme'
    >
      <span className='material-symbols-outlined text-[20px]'>
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
