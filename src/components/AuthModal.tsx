import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import {
  X,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  Building,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BadgeCheck,
  Fingerprint,
  Clock,
  RefreshCw,
  Inbox,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'verify-otp'>('login');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPasswordlessLogin, setIsPasswordlessLogin] = useState<boolean>(false);

  // Signup fields
  const [signupRole, setSignupRole] = useState<'official' | 'consumer'>('official');
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupGovId, setSignupGovId] = useState<string>('');
  const [signupDepartment, setSignupDepartment] = useState<string>('Legal Metrology Enforcement Wing');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotOtp, setForgotOtp] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState<boolean>(false);

  // Real-time OTP state
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'signup' | 'reset'>('login');
  const [otpEmail, setOtpEmail] = useState<string>('');
  const [maskedOtpEmail, setMaskedOtpEmail] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('realtime');
  const [sandboxNotice, setSandboxNotice] = useState<{
    allowedEmail: string;
    code: string;
    message: string;
  } | null>(null);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // References for 6-digit OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (authMode !== 'verify-otp' || !otpExpiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((otpExpiresAt - now) / 1000));
      setTimeRemaining(diffSec);

      if (diffSec <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authMode, otpExpiresAt]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering verify-otp mode
  useEffect(() => {
    if (authMode === 'verify-otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [authMode]);

  // Always reset back to pristine login mode whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setAuthMode('login');
      setIsPasswordlessLogin(false);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpEmail('');
      setMaskedOtpEmail('');
      setOtpExpiresAt(0);
      setResendCooldown(0);
      setSandboxNotice(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
      setIsResending(false);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    setAuthMode('login');
    setIsPasswordlessLogin(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpEmail('');
    setMaskedOtpEmail('');
    setOtpExpiresAt(0);
    setResendCooldown(0);
    setSandboxNotice(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(false);
    setIsResending(false);
    onClose();
  };

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- DIGIT INPUT HANDLERS ---
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const char = cleaned[cleaned.length - 1];
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input box
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are filled, auto-trigger verification
    const completeCode = newDigits.join('');
    if (completeCode.length === 6 && !newDigits.includes('')) {
      triggerVerifyWithCode(completeCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);

      const targetIndex = Math.min(pasted.length, 5);
      inputRefs.current[targetIndex]?.focus();

      if (pasted.length === 6) {
        triggerVerifyWithCode(pasted);
      }
    }
  };

  // --- SUBMIT LOGIN FORM ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your Email or Officer Badge ID.');
      return;
    }

    if (!isPasswordlessLogin && !loginPassword.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isPasswordlessLogin) {
        // Direct passwordless email OTP dispatch
        const res = await fetch('/api/auth/otp-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: loginIdentifier.trim(),
            purpose: 'login',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to dispatch email verification code.');
          return;
        }

        setOtpPurpose('login');
        setOtpEmail(data.email);
        setMaskedOtpEmail(data.maskedEmail || data.email);
        setOtpExpiresAt(data.expiresAt || Date.now() + 600000);
        setDeliveryMethod(data.deliveryMethod || 'realtime');
        setSandboxNotice(data.isSandboxRestricted ? {
          allowedEmail: data.allowedEmail || 'utkrishtasingoria@gmail.com',
          code: data.sandboxOtp || '',
          message: data.message || '',
        } : null);
        setResendCooldown(30);
        setOtpDigits(['', '', '', '', '', '']);
        setAuthMode('verify-otp');
        if (data.isSandboxRestricted) {
          setSuccessMessage(`Notice: Resend sandbox can only deliver real emails to ${data.allowedEmail || 'utkrishtasingoria@gmail.com'}. Test passcode provided below.`);
        } else {
          setSuccessMessage(`A 6-digit code has been dispatched to ${data.email}. Please check your inbox.`);
        }
      } else {
        // Standard password + 2FA OTP login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: loginIdentifier.trim(),
            password: loginPassword.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'Login verification failed.');
          return;
        }

        // Two-factor OTP required
        if (data.requireOtp) {
          setOtpPurpose('login');
          setOtpEmail(data.email);
          setMaskedOtpEmail(data.maskedEmail || data.email);
          setOtpExpiresAt(data.expiresAt || Date.now() + 600000);
          setDeliveryMethod(data.deliveryMethod || 'realtime');
          setSandboxNotice(data.isSandboxRestricted ? {
            allowedEmail: data.allowedEmail || 'utkrishtasingoria@gmail.com',
            code: data.sandboxOtp || '',
            message: data.message || '',
          } : null);
          setResendCooldown(30);
          setOtpDigits(['', '', '', '', '', '']);
          setAuthMode('verify-otp');
          setSuccessMessage(data.message || `A 6-digit verification code has been dispatched to ${data.email}.`);
          return;
        }

        // Direct login success
        if (data.token) {
          localStorage.setItem('labellens_token', data.token);
          localStorage.setItem('packcheck_token', data.token);
        }
        setSuccessMessage(`Authenticated successfully! Welcome, ${data.user?.name}`);
        setTimeout(() => {
          onLoginSuccess(data.user);
          handleModalClose();
        }, 500);
      }
    } catch (err) {
      console.error('Login request error:', err);
      setErrorMessage('Network error during authentication. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUBMIT SIGNUP FORM ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!signupName.trim() || signupName.trim().length < 2) {
      setErrorMessage('Please provide a valid full name (at least 2 characters).');
      return;
    }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
          governmentId: signupRole === 'official' ? (signupGovId.trim() || undefined) : undefined,
          department: signupRole === 'official' ? (signupDepartment.trim() || undefined) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initiate account registration.');
        return;
      }

      // Transition to Real-Time OTP Verification
      if (data.requireOtp) {
        setOtpPurpose('signup');
        setOtpEmail(data.email);
        setMaskedOtpEmail(data.maskedEmail || data.email);
        setOtpExpiresAt(data.expiresAt || Date.now() + 600000);
        setDeliveryMethod(data.deliveryMethod || 'realtime');
        setSandboxNotice(data.isSandboxRestricted ? {
          allowedEmail: data.allowedEmail || 'utkrishtasingoria@gmail.com',
          code: data.sandboxOtp || '',
          message: data.message || '',
        } : null);
        setResendCooldown(30);
        setOtpDigits(['', '', '', '', '', '']);
        setAuthMode('verify-otp');
        if (data.isSandboxRestricted) {
          setSuccessMessage(`Notice: Resend sandbox can only deliver real emails to ${data.allowedEmail || 'utkrishtasingoria@gmail.com'}. Test passcode provided below.`);
        } else {
          setSuccessMessage(`A 6-digit account activation code has been dispatched to ${data.email}. Please check your inbox and spam folder.`);
        }
        return;
      }

      if (data.token) {
        localStorage.setItem('labellens_token', data.token);
        localStorage.setItem('packcheck_token', data.token);
      }
      setSuccessMessage(`Account registered successfully! Welcome, ${data.user?.name}`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        handleModalClose();
      }, 600);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('Network error during registration. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- VERIFY OTP CODE ---
  const triggerVerifyWithCode = async (codeToVerify: string) => {
    resetMessages();
    if (!codeToVerify || codeToVerify.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code from your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          code: codeToVerify,
          purpose: otpPurpose,
          name: otpPurpose === 'signup' ? signupName.trim() : undefined,
          password: otpPurpose === 'signup' ? signupPassword : undefined,
          role: otpPurpose === 'signup' ? signupRole : undefined,
          governmentId: otpPurpose === 'signup' && signupRole === 'official' ? (signupGovId.trim() || undefined) : undefined,
          department: otpPurpose === 'signup' && signupRole === 'official' ? (signupDepartment.trim() || undefined) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid verification code. Please check your email inbox and try again.');
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('labellens_token', data.token);
        localStorage.setItem('packcheck_token', data.token);
      }

      setSuccessMessage(data.message || 'Verification successful! Logging you in...');
      setTimeout(() => {
        if (data.user) {
          onLoginSuccess(data.user);
        }
        handleModalClose();
      }, 600);
    } catch (err) {
      console.error('OTP verification error:', err);
      setErrorMessage('Network error while verifying passcode. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RESEND REAL-TIME OTP ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    resetMessages();
    setIsResending(true);

    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          purpose: otpPurpose,
          signupData: otpPurpose === 'signup' ? {
            name: signupName.trim(),
            role: signupRole,
            governmentId: signupGovId.trim() || undefined,
            department: signupDepartment.trim() || undefined,
            password: signupPassword,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to resend code.');
        return;
      }

      setOtpExpiresAt(data.expiresAt || Date.now() + 600000);
      setResendCooldown(30);
      setSandboxNotice(data.isSandboxRestricted ? {
        allowedEmail: data.allowedEmail || 'utkrishtasingoria@gmail.com',
        code: data.sandboxOtp || '',
        message: data.message || '',
      } : null);
      setOtpDigits(['', '', '', '', '', '']);
      if (data.isSandboxRestricted) {
        setSuccessMessage(`Notice: Resend sandbox can only deliver real emails to ${data.allowedEmail || 'utkrishtasingoria@gmail.com'}. Test passcode provided below.`);
      } else {
        setSuccessMessage(`Fresh verification code sent to ${otpEmail}. Please check your inbox and spam folder.`);
      }
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage('Failed to resend verification code. Please check connection.');
    } finally {
      setIsResending(false);
    }
  };

  // --- FORGOT PASSWORD SUBMIT ---
  const handleForgotSendOtp = async () => {
    resetMessages();
    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address first.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), purpose: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Unable to generate reset OTP.');
        return;
      }
      setIsForgotOtpSent(true);
      setSuccessMessage(`Verification code sent to ${forgotEmail.trim()}. Please check your email inbox.`);
    } catch (err) {
      setErrorMessage('Network error while requesting verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!forgotEmail.trim() || !forgotOtp.trim() || !forgotNewPassword.trim()) {
      setErrorMessage('Email, verification code, and new password are all required.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to reset password.');
        return;
      }

      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setLoginIdentifier(forgotEmail);
        setLoginPassword(forgotNewPassword);
        setAuthMode('login');
        setErrorMessage(null);
      }, 1000);
    } catch (err) {
      setErrorMessage('Network error while updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-300 relative shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Portal Header */}
        <div className="space-y-1.5 pr-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">
              DoCA Legal Metrology Portal
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {authMode === 'login' && 'Sign in to LabelLens'}
            {authMode === 'signup' && 'Create Authorized Account'}
            {authMode === 'forgot' && 'Reset Access Password'}
            {authMode === 'verify-otp' && 'Check Your Email'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {authMode === 'login' && 'Enter your credentials. A secure 6-digit OTP will be dispatched to your email.'}
            {authMode === 'signup' && 'Register as an enforcement officer or citizen auditor with real email activation.'}
            {authMode === 'forgot' && 'Authorize resetting your password via a code sent to your email.'}
            {authMode === 'verify-otp' && 'A 6-digit verification passcode has been dispatched directly to your email address.'}
          </p>
        </div>

        {/* Mode Navigation Tabs (Hidden during OTP step) */}
        {authMode !== 'verify-otp' && (
          <div className="flex border-b border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                resetMessages();
              }}
              className={`flex-1 pb-2.5 font-semibold text-center transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'text-sky-400 border-b-2 border-sky-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                resetMessages();
              }}
              className={`flex-1 pb-2.5 font-semibold text-center transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'text-sky-400 border-b-2 border-sky-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('forgot');
                resetMessages();
              }}
              className={`pb-2.5 px-3 text-xs text-center transition-all cursor-pointer ${
                authMode === 'forgot'
                  ? 'text-sky-400 border-b-2 border-sky-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Forgot?
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-sans leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-lg p-3 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-sans leading-tight">{successMessage}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            {/* Login Method Toggle */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Authentication Mode
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordlessLogin(!isPasswordlessLogin);
                  resetMessages();
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isPasswordlessLogin ? 'Use Password + Email OTP' : '⚡ Passwordless Email OTP'}
              </button>
            </div>

            {/* Identifier Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-sky-400" />
                <span>Email Address or Officer Badge ID</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. utkrishtasingoria@gmail.com or rajesh.sharma@consumeraffairs.gov.in"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
              />
            </div>

            {/* Password Input (Hidden if Instant Email OTP mode) */}
            {!isPasswordlessLogin && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-sky-400" />
                    <span>Account Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      resetMessages();
                    }}
                    className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800/60 disabled:cursor-not-allowed text-[#0A0C10] font-bold py-2.5 rounded transition-all text-xs uppercase tracking-wider mt-2 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A0C10]" />
                  <span>Sending Real OTP Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isPasswordlessLogin ? 'Send Email OTP Passcode' : 'Sign In & Send Email OTP'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= SIGNUP FORM ================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            {/* Role Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('official')}
                  className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    signupRole === 'official'
                      ? 'bg-sky-950/60 border-sky-500 text-sky-300 font-bold'
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-[11px]">Enforcement Officer</div>
                    <div className="text-[9px] text-slate-500">Legal Metrology Dept</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('consumer')}
                  className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    signupRole === 'consumer'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[11px]">Citizen Auditor</div>
                    <div className="text-[9px] text-slate-500">Public Consumer</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3 text-sky-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Utkrishta Singoria"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-sky-400" />
                  <span>Email Address (OTP will be sent here)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSignupEmail('utkrishtasingoria@gmail.com')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-mono underline cursor-pointer"
                  title="Use verified account email"
                >
                  Use utkrishtasingoria@gmail.com
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="e.g. utkrishtasingoria@gmail.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
              />
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                <span>Direct email OTP verification is active for all Gmail addresses.</span>
              </p>
            </div>

            {/* Conditional Officer Fields */}
            {signupRole === 'official' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-sky-400" />
                    <span>Officer Badge ID</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DoCA-LM-2026-901"
                    value={signupGovId}
                    onChange={(e) => setSignupGovId(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-sky-400" />
                    <span>Department</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Legal Metrology Division"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-sky-400" />
                  <span>Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-sky-400" />
                  <span>Confirm Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded bg-[#0A0C10] border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>Show passwords</span>
              </label>
              <span className="text-[10px] text-sky-400 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Dispatched to Email
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800/60 disabled:cursor-not-allowed text-[#0A0C10] font-bold py-2.5 rounded transition-all text-xs uppercase tracking-wider mt-2 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A0C10]" />
                  <span>Sending Email OTP...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Continue & Send Email Verification Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= REAL-TIME OTP VERIFICATION SCREEN (NO OTP ON SCREEN) ================= */}
        {authMode === 'verify-otp' && (
          <div className="space-y-4 text-xs">
            {/* Recipient Notice Box */}
            <div className="bg-[#0A0C10] border border-slate-800 rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                  <Inbox className="w-4 h-4 text-sky-400" />
                  <span>Code Sent to Your Email</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded font-mono bg-sky-950 text-sky-300 border border-sky-800">
                  {deliveryMethod === 'resend' || deliveryMethod === 'smtp' ? 'EMAIL DISPATCHED' : 'SENT TO INBOX'}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded flex items-center gap-2 text-slate-200">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-mono font-bold text-sky-300 break-all">{otpEmail}</span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Please check your email inbox (and also check your <strong>Spam / Junk / Promotions</strong> folder). Enter the 6-digit passcode you received to verify and sign in.
              </p>
            </div>

            {/* Resend Sandbox Notice (if applicable) */}
            {sandboxNotice && (
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-lg p-3 space-y-2 text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">
                        Resend Free-Tier Sandbox Notice
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-amber-900/80 text-amber-200 border border-amber-700/60 px-1.5 py-0.5 rounded font-bold">
                        Sandbox Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                      The Resend API key is in sandbox testing mode, which restricts real emails exclusively to the verified account owner (<strong>{sandboxNotice.allowedEmail}</strong>). Outgoing email to <em>{otpEmail}</em> was blocked by Resend policy.
                    </p>
                    {sandboxNotice.code && (
                      <div className="flex items-center justify-between bg-black/50 border border-amber-600/40 rounded p-2 mt-1">
                        <div>
                          <div className="text-[9px] text-amber-400 uppercase font-mono">Test Passcode for {otpEmail}:</div>
                          <div className="font-mono text-base font-bold text-white tracking-widest">{sandboxNotice.code}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const digits = sandboxNotice.code.split('');
                            setOtpDigits(digits);
                            triggerVerifyWithCode(sandboxNotice.code);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-[#0A0C10] font-bold px-2.5 py-1 rounded text-[10px] uppercase font-sans tracking-wide transition-all cursor-pointer shadow"
                        >
                          Auto-Fill & Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-slate-300 block text-center tracking-wider">
                Enter 6-Digit Passcode
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handleDigitPaste}
                    className="w-10 h-12 sm:w-11 sm:h-13 bg-[#0A0C10] border-2 border-slate-700 focus:border-sky-400 text-white font-mono text-xl sm:text-2xl font-bold text-center rounded-lg shadow-inner focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Expiry & Resend Controls */}
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] px-1">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Expires in:</span>
                <span className="font-bold text-amber-300">{formatTimer(timeRemaining)}</span>
              </div>
              <button
                type="button"
                disabled={resendCooldown > 0 || isResending}
                onClick={handleResendOtp}
                className="text-sky-400 hover:text-sky-300 disabled:text-slate-600 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isLoading || otpDigits.join('').length !== 6}
                onClick={() => triggerVerifyWithCode(otpDigits.join(''))}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-[#0A0C10] font-bold py-2.5 rounded transition-all text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Passcode...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Code & Complete Sign In</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode(otpPurpose === 'signup' ? 'signup' : 'login');
                  resetMessages();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5 font-sans cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Wrong Email? Back to {otpPurpose === 'signup' ? 'Registration' : 'Sign In'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-sky-400" />
                <span>Registered Account Email</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. utkrishtasingoria@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="flex-1 bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
                />
                <button
                  type="button"
                  disabled={isLoading || !forgotEmail.trim()}
                  onClick={handleForgotSendOtp}
                  className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-sky-400 px-3 py-2 rounded text-xs font-bold font-mono transition-colors shrink-0 cursor-pointer"
                >
                  {isForgotOtpSent ? 'Resend' : 'Send Code'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-sky-400" />
                <span>6-Digit Verification Code (From Email)</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit code received in email"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 font-mono tracking-widest text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-sky-400" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter at least 6 characters"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                className="w-full bg-[#0A0C10] border border-slate-800 text-slate-200 p-2.5 rounded focus:border-sky-500 focus:outline-none placeholder:text-slate-600 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800/60 text-[#0A0C10] font-bold py-2.5 rounded transition-all text-xs uppercase tracking-wider mt-3 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A0C10]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Update Password & Log In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer switch prompt */}
        {authMode !== 'verify-otp' && (
          <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400 font-sans">
            {authMode === 'login' ? (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    resetMessages();
                  }}
                  className="text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetMessages();
                  }}
                  className="text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
