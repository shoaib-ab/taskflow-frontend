import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    try {
      setLoading(true);
      await login(email, password);
      // optional: fake delay for UX (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in logic here
    console.log('Sign in with Google');
  };

  return (
    <div>
      {loading && <FullScreenLoader />}
      <div className='min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-5'>
        <ThemeToggle />
        {/* Top Branding / Logo */}
        <div className='mb-8'>
          <Logo />
        </div>

        {/* Auth Card */}
        <div className='w-full max-w-[440px] bg-white dark:bg-[#1a212f] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 lg:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-[28px] font-bold leading-tight mb-2'>
              Welcome Back
            </h1>
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
              Please enter your details to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Email Input */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'
              >
                Email address
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@company.com'
                required
                className='block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#252d3d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
              />
            </div>

            {/* Password Input */}
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Password
                </label>
                <a
                  href='#'
                  className='text-sm font-medium text-primary hover:underline'
                >
                  Forgot password?
                </a>
              </div>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#252d3d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                >
                  <span className='material-symbols-outlined text-[20px]'>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='remember-me'
                name='rememberMe'
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-600 dark:text-gray-400'
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full flex justify-center py-3.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            >
              Sign In
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200 dark:border-gray-700'></div>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-white dark:bg-[#1a212f] px-2 text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className='grid grid-cols-1 gap-3'>
            <button
              type='button'
              onClick={handleGoogleSignIn}
              className='flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a212f] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
            >
              <img
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBhMar8liXbRAkI2R2Y3Z_d3LcGwNqJVXtwSkpemreYs3wsUzJkSCssxn7RigoUKs57pr8CLy_zoSfznVBDFMJlEYZ8kUJO1MaXZUIeU3aGrM79Mw3MQVGioS5zuVnwGe1daHoG6lshlxmXtd_mcNEnrfBU9fr8xjKBLYB9NG5WOTV-xlPFiw-NT5lNwjeB0YD42RkG-d0WvuBkP3qyEZFe41UL7EnYcdG8d8C8WXR1rnm5eG27qGBmcDymlLuYDQFHMHeBSrQxZuw'
                alt='Google logo'
                className='h-5 w-5'
              />
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Signup Link */}
          <p className='mt-8 text-center text-sm text-gray-600 dark:text-gray-400'>
            Don't have an account?{' '}
            <Link
              to='/signup'
              className='font-bold text-primary hover:underline'
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Minimalist Footer */}
        <footer className='mt-12 text-center text-sm text-gray-400 dark:text-gray-600 space-x-6'>
          <a href='#' className='hover:text-gray-600 dark:hover:text-gray-300'>
            Privacy Policy
          </a>
          <a href='#' className='hover:text-gray-600 dark:hover:text-gray-300'>
            Terms of Service
          </a>
          <a href='#' className='hover:text-gray-600 dark:hover:text-gray-300'>
            Contact Support
          </a>
        </footer>
      </div>
    </div>
  );
};

export default SignIn;
