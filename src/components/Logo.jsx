const Logo = ({ size = 'default', showText = true }) => {
  return (
    <div className='flex items-center'>
      {/* Light mode logo */}
      <img
        src='/task-master-logo.png'
        alt='TaskMaster'
        className='w-40 h-auto object-contain dark:hidden'
      />
      {/* Dark mode logo */}
      <img
        src='/task-master-dark-mode-logo.png'
        alt='TaskMaster'
        className='w-40 h-auto object-contain hidden dark:block'
      />
    </div>
  );
};

export default Logo;
