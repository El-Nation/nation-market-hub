import React, { useState, useEffect } from 'react';
import { X, LogIn, AlertCircle, Loader2, KeyRound, Mail, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'admin' | 'provider' | 'customer', user: any, token: string) => void;
  onOpenRegisterModal: () => void;
  onOpenCustomerRegisterModal?: () => void;
  initialResetToken?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegisterModal,
  onOpenCustomerRegisterModal,
  initialResetToken = null,
}) => {
  const [view, setView] = useState<'login' | 'forgot' | 'reset' | '2fa_challenge'>('login');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [temp2faToken, setTemp2faToken] = useState('');

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}';

  useEffect(() => {
    if (initialResetToken) {
      setResetTokenInput(initialResetToken);
      setView('reset');
    }
  }, [initialResetToken]);

  if (!isOpen) return null;

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server is not running on ${import.meta.env.VITE_API_URL} or returned invalid response.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Check if 2FA is required for this user
      if (data.requires2FA && data.tempToken) {
        setTemp2faToken(data.tempToken);
        setView('2fa_challenge');
        return;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      onLoginSuccess(data.role, data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Server authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit authenticator code.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: temp2faToken, code: totpCode.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '2FA Verification failed.');
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      onLoginSuccess(data.role, data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || '2FA authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Reset link has been sent. Please check your email.');
      } else {
        setError(data.message || 'Failed to send password reset request.');
      }
    } catch (err: any) {
      setError('Network error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenInput, new_password: newPassword }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Password reset successful! You can now log in with your new password.');
        setTimeout(() => {
          setView('login');
          setPassword('');
          setSuccessMsg(null);
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError('Network error resetting password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: '16px' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <img src="/logo.png" alt="Nation Market Hub" style={{ height: '44px', width: 'auto', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {view === 'login' && 'Account Login'}
            {view === 'forgot' && 'Forgot Password'}
            {view === 'reset' && 'Set New Password'}
            {view === '2fa_challenge' && '2FA Verification'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {view === 'login' && 'Log in with your credentials to access your dashboard.'}
            {view === 'forgot' && 'Enter your email address to receive a password reset link.'}
            {view === 'reset' && 'Enter your secure token and choose a new password.'}
            {view === '2fa_challenge' && 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

        {/* 1. STANDARD LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                <Mail size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setError(null); setSuccessMsg(null); setView('forgot'); }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                <KeyRound size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                <Mail size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
              {submitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setView('login'); }}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setView('reset'); }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer' }}
              >
                Have a token?
              </button>
            </div>
          </form>
        )}

        {/* 3. RESET PASSWORD VIEW */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Reset Token</label>
              <input
                type="text"
                required
                placeholder="Paste token here"
                value={resetTokenInput}
                onChange={(e) => setResetTokenInput(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>New Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
              {submitting ? 'Resetting Password...' : 'Confirm Reset Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setView('login'); }}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. 2FA CHALLENGE VIEW */}
        {view === '2fa_challenge' && (
          <form onSubmit={handle2faSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px' }}>
              <ShieldCheck size={36} style={{ color: '#0284c7', margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>Two-Factor Security Code Required</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600, textAlign: 'center' }}>
                Enter 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #0284c7', borderRadius: '10px', color: '#0284c7', outline: 'none', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.4em', fontWeight: 800, fontFamily: 'monospace' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              {submitting ? 'Verifying Code...' : 'Verify & Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setView('login'); }}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Footer links for registration */}
        {view === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#64748b' }}>
            <div>
              Need a Customer Account?{' '}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCustomerRegisterModal) onOpenCustomerRegisterModal();
                }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Create Account
              </button>
            </div>
            <div>
              Are you a Service Provider?{' '}
              <button
                onClick={() => {
                  onClose();
                  onOpenRegisterModal();
                }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Join as Provider
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
