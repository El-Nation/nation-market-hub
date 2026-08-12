import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageSquare, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: number;
  enquiry_id: number;
  sender_type: 'customer' | 'provider';
  sender_name: string;
  message_text: string;
  created_at: string;
  sender_avatar?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId: number;
  customerName: string;
  providerName: string;
  serviceDescription: string;
  currentUserType: 'customer' | 'provider';
  currentUserName: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  enquiryId,
  customerName,
  providerName,
  serviceDescription,
  currentUserType,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (showLoading = false) => {
    if (!enquiryId) return;
    if (showLoading) setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${enquiryId}/messages`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      } else {
        setError(data.message || 'Unable to load messages.');
      }
    } catch (err: any) {
      console.error('Error loading chat messages:', err);
      // Only show the intrusive red banner on explicit active loading, or if the chat is completely empty
      if (showLoading || messages.length === 0) {
        setError('Unable to load messages. Please retry.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Lock body scroll, handle escape key, and trigger slide animation on mount
  useEffect(() => {
    let timeoutId: any;
    let isMounted = true;
    let currentInterval = 3000; // Start fast at 3 seconds
    let idleCount = 0;
    let lastMessageCount = 0;

    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      if (enquiryId) {
        fetchMessages(true);

        const poll = async () => {
          if (!isMounted) return;
          try {
            const res = await fetch(`${API_BASE}/api/enquiries/${enquiryId}/messages`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && isMounted) {
                const fetchedCount = data.data?.length || 0;
                
                // Adaptive Polling Logic Setup
                if (fetchedCount > lastMessageCount) {
                    currentInterval = 3000; // Someone sent a message! Speed up polling
                    idleCount = 0;
                    lastMessageCount = fetchedCount;
                } else {
                    idleCount++;
                    if (idleCount > 4) currentInterval = 8000; // Backoff after 12s of idle
                    if (idleCount > 10) currentInterval = 15000; // Maximum WAF-safe backoff
                }
                
                setMessages(data.data || []);
              }
            }
          } catch (e) {
            // Silently swallow background polling errors
          }

          if (isMounted) {
            timeoutId = setTimeout(poll, currentInterval);
          }
        };

        timeoutId = setTimeout(poll, currentInterval);
      }

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setIsVisible(false);
    }
  }, [isOpen, enquiryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${enquiryId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: currentUserType,
          sender_name: currentUserName,
          message_text: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages(false);
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Connection error while sending message.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const chatPartnerName = currentUserType === 'customer' ? (providerName || 'Service Provider') : (customerName || 'Customer');
  const partnerInitial = chatPartnerName ? chatPartnerName.charAt(0).toUpperCase() : 'P';

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.25s ease-in-out',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Click Backdrop to Close */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={onClose}
      />

      {/* Right-Side Slide-Over Panel (Desktop: 460px fixed width, Mobile: 100vw full screen) */}
      <div
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header (Fixed) */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            {(() => {
              const opponentAvatar = messages.find(m => m.sender_type !== currentUserType && m.sender_avatar)?.sender_avatar;
              if (opponentAvatar) {
                return (
                  <img 
                    src={opponentAvatar}
                    alt={chatPartnerName}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                );
              }
              return (
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  {partnerInitial}
                </div>
              );
            })()}
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.3',
                }}
              >
                {chatPartnerName}
              </h3>
              <p
                style={{
                  margin: '0.15rem 0 0 0',
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Service enquiry #{enquiryId} • {serviceDescription || 'Active Request'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={() => fetchMessages(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                padding: '0.4rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Refresh conversation"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#1e293b',
                border: 'none',
                color: '#f1f5f9',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Close chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Error Alert with Working Retry Button */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              padding: '0.75rem 1.25rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #fecaca',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMessages(true)}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Message Thread Area (ONLY component that scrolls) */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {loading ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                gap: '0.5rem',
              }}
            >
              <Loader2 size={28} className="animate-spin" color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem 1.5rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <MessageSquare size={28} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                No messages yet
              </h4>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                Start the conversation with <strong style={{ color: '#0f172a' }}>{chatPartnerName}</strong> regarding this service request.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_type === currentUserType;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      marginBottom: '0.25rem',
                      padding: '0 0.25rem',
                    }}
                  >
                    {msg.sender_name} ({msg.sender_type})
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', maxWidth: '95%' }}>
                    {msg.sender_avatar ? (
                      <img 
                        src={msg.sender_avatar} 
                        alt={msg.sender_name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isMine ? '#e0f2fe' : '#f1f5f9', color: isMine ? '#0284c7' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 800, border: '1px solid #cbd5e1' }}>
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      style={{
                        padding: '0.75rem 1.1rem',
                        borderRadius: isMine ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        backgroundColor: isMine ? '#0284c7' : '#ffffff',
                        color: isMine ? '#ffffff' : '#0f172a',
                        border: isMine ? 'none' : '1px solid #e2e8f0',
                        boxShadow: isMine
                          ? '0 3px 8px rgba(2, 132, 199, 0.25)'
                          : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        maxWidth: '100%',
                      }}
                    >
                    <p style={{ margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.message_text}
                    </p>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          marginTop: '0.35rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: isMine ? '#e0f2fe' : '#94a3b8',
                        }}
                      >
                        {formattedTime}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer (Fixed at Bottom) */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Type a message to ${chatPartnerName}...`}
            style={{
              flex: 1,
              padding: '0.75rem 1.1rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: newMessage.trim() && !sending ? '#0284c7' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
