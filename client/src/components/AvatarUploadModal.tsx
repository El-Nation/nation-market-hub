import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Camera, Image as ImageIcon, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void>;
}

// Curated gallery of high-resolution professional provider avatars
const AVATAR_PRESETS = [
  {
    id: 'chef',
    name: 'Catering & Chef',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'tech',
    name: 'Tech & IT',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'craftsman',
    name: 'Handyman & Repairs',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'electrician',
    name: 'Electrician / Eng',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'beauty',
    name: 'Beauty & Barber',
    url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'tutor',
    name: 'Education & Tutor',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'mechanic',
    name: 'Auto & Mechanic',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'events',
    name: 'Events & Decor',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'cleaning',
    name: 'Home & Cleaning',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=250&q=80',
  },
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || AVATAR_PRESETS[0].url);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar || AVATAR_PRESETS[0].url);
      setPreviewError(false);
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatar(event.target.result as string);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let finalUrl = selectedAvatar;
    if (activeTab === 'url') {
      if (!customUrl.trim()) return;
      finalUrl = customUrl.trim();
    }

    setSaving(true);
    try {
      await onSaveAvatar(finalUrl);
      onClose();
    } catch (err) {
      console.error('Failed to save profile picture:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Camera size={22} style={{ color: '#38bdf8' }} />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Update Profile Picture</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '0.4rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Avatar Preview Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={previewError ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' : selectedAvatar}
                alt="Profile Preview"
                onError={() => setPreviewError(true)}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #0284c7',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '0.25rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} />
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                Profile Picture Preview
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                This picture will be displayed on your service listings and customer chat.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              background: '#f1f5f9',
              padding: '0.35rem',
              borderRadius: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'presets' ? '#ffffff' : 'transparent',
                color: activeTab === 'presets' ? '#0284c7' : '#64748b',
                boxShadow: activeTab === 'presets' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
              }}
            >
              <Sparkles size={16} />
              <span>Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'upload' ? '#ffffff' : 'transparent',
                color: activeTab === 'upload' ? '#0284c7' : '#64748b',
                boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
              }}
            >
              <Upload size={16} />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'url' ? '#ffffff' : 'transparent',
                color: activeTab === 'url' ? '#0284c7' : '#64748b',
                boxShadow: activeTab === 'url' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
              }}
            >
              <LinkIcon size={16} />
              <span>Image URL</span>
            </button>
          </div>

          {/* Tab Content 1: Presets Grid */}
          {activeTab === 'presets' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.85rem',
                maxHeight: '230px',
                overflowY: 'auto',
                paddingRight: '0.25rem',
              }}
            >
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(preset.url);
                      setPreviewError(false);
                    }}
                    style={{
                      border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.6rem',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isSelected ? '#0284c7' : '#475569',
                        textAlign: 'center',
                        lineHeight: '1.2',
                      }}
                    >
                      {preset.name}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={11} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Content 2: Upload Photo */}
          {activeTab === 'upload' && (
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('avatar-file-input')?.click()}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <ImageIcon size={26} />
              </div>
              <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                Click to upload a profile photo
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                PNG, JPG, or WEBP (Max 5MB)
              </p>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Tab Content 3: Image URL */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Paste Image Address (URL):
              </label>
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedAvatar(e.target.value.trim());
                    setPreviewError(false);
                  }
                }}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: '#f8fafc',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                <span>Save Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
