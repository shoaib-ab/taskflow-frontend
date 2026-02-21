import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

const SignUp = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      alert('You must agree to the terms and conditions');
      return;
    }

    if (loading) return; // Prevent multiple submissions
    try {
      setLoading(true);
      await register(name, email, password);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setAgreeTerms(false);

      // optional: fake delay for UX (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      navigate('/dashboard');
    } catch (error) {
      alert(error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {loading && <FullScreenLoader />}
      <div className='bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-12 transition-colors duration-300'>
        <ThemeToggle />

        {/* Main Card Container */}
        <div className='max-w-[1100px] w-full bg-white dark:bg-[#1a2131] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800'>
          {/* Left Section: Registration Form */}
          <div className='flex-1 p-8 md:p-12 lg:p-16'>
            {/* Header/Logo */}
            <div
              onClick={() => navigate('/')}
              className='flex items-center gap-2 mb-8 cursor-pointer'
            >
              <div className='size-8 bg-primary rounded-lg flex items-center justify-center text-white'>
                <span className='material-symbols-outlined text-2xl'>
                  task_alt
                </span>
              </div>
              <h2 className='text-[#0d121b] dark:text-white text-xl font-bold tracking-tight'>
                TaskFlow
              </h2>
            </div>

            <div className='mb-10'>
              <h1 className='text-[#0d121b] dark:text-white text-3xl font-bold mb-2'>
                Create your account
              </h1>
              <p className='text-slate-500 dark:text-slate-400'>
                Join thousands of high-productivity teams today.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 gap-5'>
                {/* Full Name */}
                <div className='flex flex-col gap-2'>
                  <label className='text-[#0d121b] dark:text-slate-200 text-sm font-semibold'>
                    Full Name
                  </label>
                  <div className='relative'>
                    <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl'>
                      person
                    </span>
                    <input
                      name='name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white'
                      placeholder='John Doe'
                      type='text'
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className='flex flex-col gap-2'>
                  <label className='text-[#0d121b] dark:text-slate-200 text-sm font-semibold'>
                    Work Email
                  </label>
                  <div className='relative'>
                    <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl'>
                      mail
                    </span>
                    <input
                      name='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white'
                      placeholder='name@company.com'
                      type='email'
                      required
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-[#0d121b] dark:text-slate-200 text-sm font-semibold'>
                      Password
                    </label>
                    <div className='relative'>
                      <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl'>
                        lock
                      </span>
                      <input
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full pl-10 pr-4 py-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white'
                        placeholder='••••••••'
                        type='password'
                        required
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label className='text-[#0d121b] dark:text-slate-200 text-sm font-semibold'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl'>
                        lock_clock
                      </span>
                      <input
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='w-full pl-10 pr-4 py-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white'
                        placeholder='••••••••'
                        type='password'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Policy */}
              <div className='flex items-start gap-3 py-2'>
                <input
                  id='terms'
                  name='agreeTerms'
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className='mt-1 size-4 text-primary border-slate-300 rounded focus:ring-primary'
                  type='checkbox'
                  required
                />
                <label
                  className='text-sm text-slate-500 dark:text-slate-400 leading-snug'
                  htmlFor='terms'
                >
                  By creating an account, I agree to the{' '}
                  <Link className='text-primary hover:underline' to='#'>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link className='text-primary hover:underline' to='#'>
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Action Button */}
              <button
                className='w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-lg'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
                <span className='material-symbols-outlined'>arrow_forward</span>
              </button>

            </form>

            <p className='mt-8 text-center text-slate-600 dark:text-slate-400'>
              Already have an account?
              <Link
                className='text-primary font-semibold hover:underline'
                to='/login'
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Right Section: Visual / Premium SaaS Content */}
          <div className='hidden md:flex flex-1 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white'>
            {/* Subtle Background Pattern */}
            <div
              className='absolute inset-0 opacity-10'
              style={{
                backgroundImage:
                  'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            {/* Abstract Graphic / Shape */}
            <div className='absolute -top-24 -right-24 size-64 bg-white/10 rounded-full blur-3xl'></div>
            <div className='absolute bottom-1/4 -left-12 size-48 bg-black/10 rounded-full blur-2xl'></div>

            <div className='relative z-10'>
              <div className='inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm mb-6'>
                <span className='material-symbols-outlined text-sm'>
                  auto_awesome
                </span>
                PRO EDITION
              </div>
              <h3 className='text-4xl font-bold leading-tight mb-6'>
                Streamline your workflow in minutes.
              </h3>
              <ul className='space-y-4'>
                <li className='flex items-center gap-3'>
                  <span className='material-symbols-outlined text-primary bg-white rounded-full p-1 text-sm font-bold'>
                    check
                  </span>
                  <span>Automated task prioritization</span>
                </li>
                <li className='flex items-center gap-3'>
                  <span className='material-symbols-outlined text-primary bg-white rounded-full p-1 text-sm font-bold'>
                    check
                  </span>
                  <span>Real-time team collaboration</span>
                </li>
                <li className='flex items-center gap-3'>
                  <span className='material-symbols-outlined text-primary bg-white rounded-full p-1 text-sm font-bold'>
                    check
                  </span>
                  <span>Advanced performance analytics</span>
                </li>
              </ul>
            </div>

            {/* Visual Content */}
            <div className='relative z-10 mt-12 bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md'>
              <div className='flex items-center gap-4 mb-4'>
                <img
                  className='size-12 rounded-full border-2 border-white/30'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBErLDa9maD3QJvDmLzgXSWBv7rfu5HRcFargu-4jhQHMb68zde4f8A5kkbZ7LJRbvFAH0U2Md0g3FidSEMqD_EvZf3GwZkH9k_DRtlm2QB5LszoqpmoXQClBeKJiVNsqKicb_3rgdwbUkOU35xQjt22lx_rVRpFwLd8ax9TnYMQ7e6QRW9x7O4RQ1JWHyaXIa9QJMyIva4JzI32QMupoTi2lfHVqWino94IldgRW9Gr6x0sfQqheiORgs76cL9XSVAa5NG0OC3sG8'
                  alt='Alex Chen'
                />
                <div>
                  <p className='font-bold text-sm'>Alex Chen</p>
                  <p className='text-xs text-white/70'>CTO at TechFlow</p>
                </div>
              </div>
              <p className='italic text-sm leading-relaxed text-white/90'>
                "TaskFlow has transformed how our engineering team ships code.
                We've seen a 40% increase in productivity since switching."
              </p>
              {/* Rating */}
              <div className='mt-4 flex gap-1 text-yellow-400'>
                <span className='material-symbols-outlined text-lg fill-1'>
                  star
                </span>
                <span className='material-symbols-outlined text-lg fill-1'>
                  star
                </span>
                <span className='material-symbols-outlined text-lg fill-1'>
                  star
                </span>
                <span className='material-symbols-outlined text-lg fill-1'>
                  star
                </span>
                <span className='material-symbols-outlined text-lg fill-1'>
                  star
                </span>
              </div>
            </div>

            <div className='relative z-10 text-xs text-white/50 flex justify-between items-center mt-8'>
              <span>© 2024 TaskFlow Inc.</span>
              <div className='flex gap-4'>
                <Link className='hover:text-white transition-colors' to='#'>
                  Help
                </Link>
                <Link className='hover:text-white transition-colors' to='#'>
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
