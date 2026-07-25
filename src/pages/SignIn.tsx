import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, User, Mail, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { motion } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import UserAvatar from '../components/UserAvatar';

export default function SignIn() {
  const navigate = useNavigate();
  const store = useStore();
  const [email, setEmail] = useState('demo@jobx.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = store.login(email.trim(), password);
      if (result.success) {
        setLoggedInUser({ name: store.user.name, email: store.user.email });
      } else {
        setError(result.error || 'Login failed.');
      }
      setLoading(false);
    }, 500);
  };

  if (loggedInUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4"
            >
              <CheckCircle className="w-9 h-9 text-white" />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back!</h2>
            <p className="text-sm text-gray-500 mt-1">Successfully signed in</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="h-24 gradient-header relative" />
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <UserAvatar src={store.user.avatar} name={loggedInUser.name} size="xl" className="w-24 h-24 border-4 border-white shadow-lg" />
              </div>
              <div className="text-center space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{loggedInUser.name}</h3>
                  <p className="text-sm text-gray-500">{loggedInUser.email}</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Full Stack Developer</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">342</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">89</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">14</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Endorsements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-blue-500/25 text-sm font-medium text-white gradient-primary transition-colors"
          >
            Continue to Jobx <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex justify-center"
      >
        <div className="form_container">
          <div className="flex justify-center w-full mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center"
            >
              <BrandLogo className="h-14 w-14" showWordmark={false} />
            </motion.div>
          </div>
          <div className="title_container">
            <p className="title">Login to your Account</p>
            <span className="subtitle">Get started with Jobx, just sign in and enjoy the experience.</span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 text-center"
            >
              {error}
            </motion.div>
          )}

          <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="input_container">
              <label className="input_label" htmlFor="email_field">Email address</label>
              <Mail className="icon w-4 h-4" />
              <input 
                id="email_field"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="input_field" 
                placeholder="demo@jobx.com" 
              />
            </div>
            
            <div className="input_container">
              <label className="input_label" htmlFor="password_field">Password</label>
              <Eye className="icon w-4 h-4 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
              <input 
                id="password_field"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="input_field" 
                placeholder="password123" 
              />
            </div>
            
            <button title="Sign In" type="submit" className="sign-in_btn" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
            <Link to="/signup" className="note">Forgot password? / Create an account</Link>
          </form>
          
          <div className="separator">
            <hr className="line" />
            <span>Or continue with</span>
            <hr className="line" />
          </div>

          <button title="Sign In with Google" className="sign-in_ggl">
            <svg height="18" width="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              <path d="M1 1h22v22H1z" fill="none"></path>
            </svg>
            <span>Sign In with Google</span>
          </button>
          
          <button title="Sign In with Apple" className="sign-in_apl">
            <svg height="18" width="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.15 4.3c-.02.04-.04.09-.07.13-.19.26-.41.51-.66.75-.85.81-1.94 1.25-3.03 1.25-.09 0-.17 0-.26-.01 0-.02-.01-.03-.01-.05 0-.69.21-1.39.6-1.99.37-.57.85-1.07 1.4-1.45.62-.43 1.34-.73 2.1-.86.13-.02.26-.03.4-.04 0 .09 0 .19-.07.27zM19.14 11.23c0-2.88 1.41-4.23 4.22-4.5-1.89-2.73-4.88-3-5.83-3.03-1.92-.19-3.79 1.1-4.78 1.1-.98 0-2.54-1.07-4.14-1.05-2.07.03-3.99 1.19-5.06 2.99C1.3 10.45.36 14.59 2.5 17.65c1.05 1.5 2.29 3.19 3.94 3.13 1.59-.06 2.2-.99 4.14-.99 1.93 0 2.49.99 4.15.96 1.69-.03 2.78-1.54 3.82-3.03.6-.86 1.12-1.78 1.55-2.74-2.81-1.12-4.32-3.66-4.28-6.73z" fill="#FFFFFF"></path>
            </svg>
            <span>Sign In with Apple</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
