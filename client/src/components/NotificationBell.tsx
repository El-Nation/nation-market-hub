import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: number;
  user_type: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  userType: 'customer' | 'provider' | 'admin';
  userId: string | number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userType, userId }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const lastSeenMaxIdRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  // Get or initialize singleton AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    return audioCtxRef.current;
  };

  // User gesture handler to resume AudioContext if suspended by browser autoplay policy
  useEffect(() => {
    const handleUserGesture = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch((err) => console.error('[NOTIFICATION SOUND DEBUG] Resume error:', err));
      }
    };

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, []);

  // Plays a crisp dual-tone chime when a new unread notification arrives
  const playNotificationChime = async (newItems: NotificationItem[]) => {
    console.log('[NOTIFICATION SOUND DEBUG] New notification detected:', newItems);
    console.log('[NOTIFICATION SOUND DEBUG] Attempting to play notification sound...');

    try {
      const ctx = getAudioContext();
      if (!ctx) {
        console.warn('[NOTIFICATION SOUND DEBUG] AudioContext not supported in this browser.');
        return;
      }

      console.log('[NOTIFICATION SOUND DEBUG] AudioContext state:', ctx.state);

      if (ctx.state === 'suspended') {
        console.log('[NOTIFICATION SOUND DEBUG] Resuming suspended AudioContext...');
        await ctx.resume();
        console.log('[NOTIFICATION SOUND DEBUG] AudioContext state after resume:', ctx.state);
      }

      const now = ctx.currentTime;

      // Tone 1: E5 (659.25 Hz) - Crisp Bell Chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2: A5 (880.00 Hz) - Higher Harmonious Chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

      console.log('[NOTIFICATION SOUND DEBUG] Notification sound played successfully!');
    } catch (e: any) {
      console.error('[NOTIFICATION SOUND DEBUG] Failed to play notification sound:', e?.message || e);
    }
  };

  const fetchNotifications = async (showLoading = false) => {
    if (!userId) return;
    if (showLoading) setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/notifications?user_type=${userType}&user_id=${encodeURIComponent(userId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const list: NotificationItem[] = data.data || [];
          const currentUnread = data.unread_count || 0;

          // Find highest notification ID in this payload
          const currentMaxId = list.reduce((max, item) => (item.id > max ? item.id : max), 0);

          // Persistent Tracker across refreshes
          const storageKey = `notification_last_seen_${userType}_${userId}`;
          const savedMaxId = parseInt(localStorage.getItem(storageKey) || '0', 10);
          
          const maxSeen = Math.max(savedMaxId, lastSeenMaxIdRef.current);

          // Detect genuinely new unread notification higher than any we've ever seen
          if (!isInitialLoadRef.current && currentMaxId > maxSeen) {
            const newUnreadItems = list.filter(item => item.id > maxSeen && !item.is_read);
            if (newUnreadItems.length > 0) {
              playNotificationChime(newUnreadItems);
            }
          }

          if (currentMaxId > maxSeen) {
            lastSeenMaxIdRef.current = currentMaxId;
            localStorage.setItem(storageKey, currentMaxId.toString());
          }

          isInitialLoadRef.current = false;
          setNotifications(list);
          setUnreadCount(currentUnread);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    isInitialLoadRef.current = true;
    lastSeenMaxIdRef.current = 0;

    fetchNotifications(true);
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 5000);

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userType, userId]);

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: userType, user_id: String(userId) }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          padding: '0.55rem',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#334155',
          transition: 'all 0.2s ease',
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
            border: '1px solid #e2e8f0',
            zIndex: 99999,
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.9rem 1.1rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#38bdf8" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Notifications</h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCheck size={15} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                <span style={{ fontSize: '0.85rem' }}>Loading alerts...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <Bell size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
                  No notifications yet
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem' }}>
                  You will receive real-time alerts when requests or messages update.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const formattedTime = new Date(item.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const formattedDate = new Date(item.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.is_read) markAsRead(item.id);
                    }}
                    style={{
                      padding: '0.85rem 1.1rem',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: item.is_read ? '#ffffff' : '#f0f9ff',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    {!item.is_read ? (
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          backgroundColor: '#0284c7',
                          borderRadius: '50%',
                          marginTop: '0.35rem',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          backgroundColor: '#cbd5e1',
                          borderRadius: '50%',
                          marginTop: '0.35rem',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.15rem',
                        }}
                      >
                        <h5
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            color: item.is_read ? '#334155' : '#0f172a',
                          }}
                        >
                          {item.title}
                        </h5>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                          {formattedDate} {formattedTime}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: '#475569',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.message}
                      </p>
                    </div>

                    {!item.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '0.2rem',
                        }}
                        title="Mark as read"
                      >
                        <Check size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
