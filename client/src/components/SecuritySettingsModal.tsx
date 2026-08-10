import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, X, Copy, Mail } from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'customer' | 'provider' | 'admin';
  userEmail: string;
  is2faEnabled?: boolean;
  on2faStatusChange?: (enabled: boolean) => void;
  onEmailUpdated?: (newEmail: string, newToken?: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userEmail,
  is2faEnabled = false,
  on2faStatusChange,
  onEmailUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'email' | '2fa'>('password');

  // Change Email State
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA Setup State
  const [twoFactorActive, setTwoFactorActive] = useState<boolean>(is2faEnabled);
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'disable'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPassLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPassMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMessage({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPassMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    if (!newEmailInput || !newEmailInput.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Please enter a valid structure for the new email address.' });
      return;
    }

    setEmailLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: emailConfirmPassword,
          new_email: newEmailInput.toLowerCase().trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailMessage({ type: 'success', text: 'Email successfully updated! Your session has been refreshed.' });
        if (data.token) {
          if (userRole === 'admin') {
            localStorage.setItem('auth_token', data.token);
          } else {
            localStorage.setItem('token', data.token);
          }
        }
        setNewEmailInput('');
        setEmailConfirmPassword('');
        if (onEmailUpdated) onEmailUpdated(data.email || newEmailInput, data.token);
      } else {
        setEmailMessage({ type: 'error', text: data.message || 'Failed to update email address.' });
      }
    } catch (err: any) {
      setEmailMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const start2faSetup = async () => {
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSecretKey(data.secret);
        setQrCodeUrl(data.qr_code_url);
        setSetupStep('qr');
      } else {
        setTwoFactorMessage({ type: 'error', text: data.message || 'Failed to initialize 2FA setup.' });
      }
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: 'Network error starting 2FA setup.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMessage(null);

    if (!totpCode || totpCode.trim().length !== 6) {
      setTwoFactorMessage({ type: 'error', text: 'Please enter a valid 6-digit authenticator code.' });
      return;
    }

    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/2fa/verify-enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          secret: secretKey,
          code: totpCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorActive(true);
        setSetupStep('idle');
        setTotpCode('');
        setTwoFactorMessage({ type: 'success', text: 'Two-Factor Authentication (2FA) is now active on your account!' });
        if (on2faStatusChange) on2faStatusChange(true);
      } else {
        setTwoFactorMessage({ type: 'error', text: data.message || 'Invalid code. Please verify your app.' });
      }
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: 'Network error verifying 2FA code.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMessage(null);

    if (!disablePassword) {
      setTwoFactorMessage({ type: 'error', text: 'Please enter your password to disable 2FA.' });
      return;
    }

    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: disablePassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorActive(false);
        setSetupStep('idle');
        setDisablePassword('');
        setTwoFactorMessage({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
        if (on2faStatusChange) on2faStatusChange(false);
      } else {
        setTwoFactorMessage({ type: 'error', text: data.message || 'Failed to disable 2FA.' });
      }
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: 'Network error disabling 2FA.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        zIndex: 99999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          maxWidth: '550px', 
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff', 
          padding: 0, 
          borderRadius: '16px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Account & Security Settings</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Manage password and 2-step verification for {userRole} ({userEmail})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: 'none', 
              color: '#ffffff', 
              padding: '0.4rem', 
              borderRadius: '8px',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.4rem' }}>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '12px',
              background: activeTab === 'password' ? '#ffffff' : 'transparent',
              color: activeTab === 'password' ? '#0284c7' : '#64748b',
              boxShadow: activeTab === 'password' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              border: activeTab === 'password' ? '1px solid #e2e8f0' : '1px solid transparent',
            }}
          >
            <KeyRound size={16} /> Password
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '12px',
              background: activeTab === 'email' ? '#ffffff' : 'transparent',
              color: activeTab === 'email' ? '#0284c7' : '#64748b',
              boxShadow: activeTab === 'email' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              border: activeTab === 'email' ? '1px solid #e2e8f0' : '1px solid transparent',
            }}
          >
            <Mail size={16} /> Email
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '12px',
              background: activeTab === '2fa' ? '#ffffff' : 'transparent',
              color: activeTab === '2fa' ? '#0284c7' : '#64748b',
              boxShadow: activeTab === '2fa' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              border: activeTab === '2fa' ? '1px solid #e2e8f0' : '1px solid transparent',
            }}
          >
            <ShieldCheck size={16} /> 2FA
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {passMessage && (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  background: passMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
                  color: passMessage.type === 'success' ? '#065f46' : '#9f1239',
                  border: passMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                }}>
                  {passMessage.type === 'success' ? <CheckCircle2 size={16} style={{ minWidth: '16px' }} /> : <AlertCircle size={16} style={{ minWidth: '16px' }} />}
                  <span>{passMessage.text}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {passLoading ? 'Updating Password...' : <><KeyRound size={16} /> Update Password</>}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {emailMessage && (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  background: emailMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
                  color: emailMessage.type === 'success' ? '#065f46' : '#9f1239',
                  border: emailMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                }}>
                  {emailMessage.type === 'success' ? <CheckCircle2 size={16} style={{ minWidth: '16px' }} /> : <AlertCircle size={16} style={{ minWidth: '16px' }} />}
                  <span>{emailMessage.text}</span>
                </div>
              )}

              <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', color: '#475569' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#1e293b' }}>Current Registered Email:</p>
                <p style={{ margin: 0, fontFamily: 'monospace', color: '#0284c7', fontWeight: 700 }}>{userEmail}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>New Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="e.g. support@example.com"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Current Password (To Confirm)</label>
                <input
                  type="password"
                  required
                  value={emailConfirmPassword}
                  onChange={(e) => setEmailConfirmPassword(e.target.value)}
                  placeholder="Enter current password to verify"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {emailLoading ? 'Updating Email...' : <><Mail size={16} /> Update Email Address</>}
                </button>
              </div>
            </form>
          )}

          {activeTab === '2fa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {twoFactorMessage && (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  background: twoFactorMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
                  color: twoFactorMessage.type === 'success' ? '#065f46' : '#9f1239',
                  border: twoFactorMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                }}>
                  {twoFactorMessage.type === 'success' ? <CheckCircle2 size={16} style={{ minWidth: '16px' }} /> : <AlertCircle size={16} style={{ minWidth: '16px' }} />}
                  <span>{twoFactorMessage.text}</span>
                </div>
              )}

              {/* Status Banner */}
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                border: twoFactorActive ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                background: twoFactorActive ? '#ecfdf5' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {twoFactorActive ? <ShieldCheck size={24} style={{ color: '#059669' }} /> : <ShieldAlert size={24} style={{ color: '#94a3b8' }} />}
                  <div>
                    <h4 style={{ margin: '0 0 0.15rem 0', fontWeight: 700, fontSize: '0.85rem', color: twoFactorActive ? '#064e3b' : '#334155' }}>
                      {twoFactorActive ? '2FA is Active & Protecting Account' : 'Two-Factor Authentication is Disabled'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      {twoFactorActive ? 'Requires a 6-digit authenticator code on each sign in.' : 'Add an extra layer of security.'}
                    </p>
                  </div>
                </div>

                {!twoFactorActive && setupStep === 'idle' && (
                  <button
                    onClick={start2faSetup}
                    disabled={twoFactorLoading}
                    style={{ padding: '0.5rem 0.85rem', background: '#059669', color: 'white', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    {twoFactorLoading ? 'Loading...' : 'Enable 2FA'}
                  </button>
                )}

                {twoFactorActive && setupStep === 'idle' && (
                  <button
                    onClick={() => setSetupStep('disable')}
                    style={{ padding: '0.5rem 0.85rem', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    Disable 2FA
                  </button>
                )}
              </div>

              {/* Step 2: QR Code & Verification Form */}
              {setupStep === 'qr' && (
                <form onSubmit={handleVerifyEnable2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                    </p>
                    
                    {qrCodeUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <img
                          src={qrCodeUrl}
                          alt="2FA QR Code"
                          style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', padding: '0.5rem' }}
                        />
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Or manually enter this secret key into your app:
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <code style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                          {secretKey}
                        </code>
                        <button
                          type="button"
                          onClick={copySecretToClipboard}
                          title="Copy Secret"
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                          <Copy size={14} />
                        </button>
                        {copiedSecret && <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>Copied!</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Enter 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{ width: '100%', padding: '0.75rem', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.4em', fontFamily: 'monospace', fontWeight: 700, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setSetupStep('idle')}
                      className="btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={twoFactorLoading}
                      className="btn-primary"
                      style={{ flex: 1, background: '#059669' }}
                    >
                      {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </div>
                </form>
              )}

              {/* Disable 2FA Form */}
              {setupStep === 'disable' && (
                <form onSubmit={handleDisable2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Authenticate to Confirm</label>
                    <input
                      type="password"
                      required
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Enter your current password"
                      style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setSetupStep('idle')}
                      className="btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={twoFactorLoading}
                      className="btn-primary"
                      style={{ flex: 1, background: '#e11d48' }}
                    >
                      {twoFactorLoading ? 'Disabling...' : 'Confirm Disable'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
