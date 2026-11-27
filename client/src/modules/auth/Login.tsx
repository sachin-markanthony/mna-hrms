import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { HrmsIllustration } from './HrmsIllustration';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { useAuth } from './AuthContext';
import { authApi } from './auth.api';
import { ROLES, type UserRole } from './types';

export function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'PASSWORD' | 'DONE'>('EMAIL');
  const [forgotOtp, setForgotOtp] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(45);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!forgotOpen || forgotStep !== 'OTP' || otpSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotOpen, forgotStep, otpSecondsLeft]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your work email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your portal password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const sendOtpRequest = async () => {
    setForgotError('');
    if (!forgotEmail.trim()) return;
    try {
      setForgotLoading(true);
      await authApi.forgotPassword({ email: forgotEmail.trim() });
      setForgotOtp('');
      setOtpSecondsLeft(45);
      setForgotStep('OTP');
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendOtpRequest();
  };

  const handleVerifyOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (otpSecondsLeft <= 0) {
      setForgotError('OTP expired (45 seconds limit). Please click Resend OTP.');
      return;
    }
    try {
      setForgotLoading(true);
      await authApi.verifyOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
      });
      setForgotStep('PASSWORD');
    } catch (err: any) {
      setForgotError(err?.message || 'Invalid or expired OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const pwd = forgotNewPassword.trim();
    if (pwd.length < 4 || pwd.length > 10) {
      setForgotError('Password must be between 4 and 10 characters.');
      return;
    }
    if (pwd !== forgotConfirmPassword.trim()) {
      setForgotError('Passwords do not match.');
      return;
    }
    try {
      setForgotLoading(true);
      await authApi.resetPassword({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: pwd,
      });
      setEmail(forgotEmail.trim());
      setPassword('');
      setForgotStep('DONE');
      setTimeout(() => {
        setForgotOpen(false);
        setForgotStep('EMAIL');
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }, 2200);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickFill = (roleKey: UserRole) => {
    setSelectedRole(roleKey);
    setEmail(ROLES[roleKey].email);
    setPassword(ROLES[roleKey].password);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Left Column: Mark Anthony Ventures Corporate Showcase */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] min-h-[520px] lg:min-h-screen bg-gradient-to-br from-[#062548] via-[#072b53] to-[#041c38] flex flex-col justify-between p-8 sm:p-12 xl:p-14 overflow-hidden text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#133d6d] opacity-35 pointer-events-none" />
        <div className="absolute top-36 left-16 w-12 h-12 rounded-full bg-white opacity-85 pointer-events-none" />
        <div className="absolute bottom-28 right-14 w-28 h-28 rounded-full bg-[#123863] pointer-events-none" />
        <div className="absolute bottom-12 left-14 w-7 h-7 rounded-full bg-white opacity-40 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size="lg" light />
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs uppercase tracking-widest font-black text-amber-400">
              Enterprise Suite
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">
              Human Resource Management System
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-6 w-full flex items-center justify-center">
          <HrmsIllustration className="scale-100 lg:scale-105" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300/80 pt-3 border-t border-white/10 gap-2">
          <span className="font-semibold tracking-wide">
            <strong className="text-white font-extrabold">HRMS:</strong> Human Resource Management System
          </span>
          <span className="text-slate-400 text-[11px]">&copy; {new Date().getFullYear()} Mark Anthony Ventures</span>
        </div>
      </div>

      {/* Right Column: Enlarged, Professional Authentication Card */}
      <div className="relative flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-white overflow-hidden min-h-screen">
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-64 sm:h-80 pointer-events-none select-none z-0">
          <svg
            viewBox="0 0 320 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-right-top"
          >
            <path
              d="M120 0 C150 40 180 30 210 70 C240 110 280 90 320 130 L320 0 Z"
              fill="#22d3ee"
              opacity="0.85"
            />
            <path
              d="M180 0 C210 35 220 50 250 80 C275 105 295 110 320 145 L320 0 Z"
              fill="#1d4ed8"
            />
            <circle cx="160" cy="80" r="8" fill="#06b6d4" />
            <circle cx="210" cy="115" r="6" fill="#3b82f6" />
            <circle cx="280" cy="170" r="10" fill="#0284c7" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-[480px] sm:max-w-[510px] bg-white rounded-3xl shadow-[0_16px_50px_-12px_rgba(0,0,0,0.14)] border border-slate-100 p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2
              className="text-3xl sm:text-4xl font-serif font-black text-[#072b53] tracking-tight"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
            >
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 tracking-wide">
              Sign in to your <span className="text-[#072b53] font-bold">Human Resource Management System</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5 stroke-[1.8]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@markanthony.in"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 border-slate-700 text-sm sm:text-base focus:outline-none focus:border-[#072b53] focus:ring-2 focus:ring-[#072b53]/20 transition-all placeholder:text-slate-400 font-normal bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your portal password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-lg border-2 border-slate-300 text-sm sm:text-base focus:outline-none focus:border-[#072b53] focus:ring-2 focus:ring-[#072b53]/20 transition-all placeholder:text-slate-400 font-normal bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-5 h-5 stroke-[1.8]" />
                  )}
                </button>
              </div>

              <div className="text-right mt-2.5">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-bold text-slate-600 hover:text-[#072b53] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-6 rounded-lg font-black text-sm sm:text-base tracking-widest uppercase text-white transition-all duration-150 hover:bg-[#041c38] hover:shadow-lg active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md bg-[#072b53]"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Development Quick-Fill Account
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(ROLES) as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickFill(r)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer border ${selectedRole === r
                    ? 'bg-[#072b53] text-white border-[#072b53]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                >
                  {ROLES[r].title}
                </button>
              ))}
            </div>

            {selectedRole && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-left text-[11px] space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{ROLES[selectedRole].personName}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {ROLES[selectedRole].employeeId}
                  </span>
                </div>
                <div className="text-slate-600">
                  Email: <span className="font-mono font-semibold">{ROLES[selectedRole].email}</span>
                </div>
                <div className="text-slate-600">
                  Password: <span className="font-mono font-semibold">{ROLES[selectedRole].password}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 p-7">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#072b53] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Reset Portal Password</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
              {forgotStep === 'EMAIL'
                ? 'Enter your registered work email address to receive a 6-digit OTP.'
                : forgotStep === 'OTP'
                ? `Enter the 6-digit OTP sent to ${forgotEmail} within 45 seconds.`
                : forgotStep === 'PASSWORD'
                ? 'OTP verified! Set your new password (4 to 10 characters).'
                : 'Your password has been updated securely.'}
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {forgotError}
              </div>
            )}

            {forgotStep === 'DONE' ? (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password updated successfully! You can now sign in with your new password.</span>
              </div>
            ) : forgotStep === 'OTP' ? (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 uppercase tracking-wider">6-Digit OTP</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono ${
                      otpSecondsLeft > 10
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {otpSecondsLeft > 0 ? `${otpSecondsLeft}s left` : 'Expired'}
                  </span>
                </div>
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm font-mono tracking-widest focus:outline-none focus:border-[#072b53] bg-white text-slate-900"
                />

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setForgotStep('EMAIL')}
                    className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={forgotLoading || otpSecondsLeft > 0}
                    onClick={() => void sendOtpRequest()}
                    className="text-[#072b53] font-bold hover:underline disabled:opacity-40 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || otpSecondsLeft <= 0}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#041c38] disabled:opacity-50 cursor-pointer transition shadow-xs"
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            ) : forgotStep === 'PASSWORD' ? (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Password (4 to 10 characters)
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={4}
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#072b53] bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={4}
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#072b53] bg-white text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#041c38] disabled:opacity-50 cursor-pointer transition shadow-xs"
                >
                  {forgotLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@markanthony.in"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#072b53] bg-white text-slate-900"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#041c38] disabled:opacity-50 cursor-pointer transition shadow-xs"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
