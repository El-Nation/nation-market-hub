import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, XCircle, Star, MessageSquare, Award, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  totalEnquiries: number;
  completedCount: number;
  acceptedCount: number;
  pendingCount: number;
  cancelledCount: number;
  completionRate: number;
  responseRate: number;
  averageRating: number;
  totalReviews: number;
}

interface ProviderAnalyticsProps {
  providerId: number;
}

export const ProviderAnalytics: React.FC<ProviderAnalyticsProps> = ({ providerId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/providers/${providerId}/analytics`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.message || 'Failed to load analytics.');
      }
    } catch (err: any) {
      console.error('Error fetching provider analytics:', err);
      setError('Unable to load performance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchAnalytics();
    }
  }, [providerId]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#0284c7' }} />
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Calculating performance metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#fef2f2', borderRadius: '12px', color: '#b91c1c', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{error || 'Unable to display analytics'}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #e2e8f0',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Performance & Analytics Overview
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Real-time enquiry metrics, completion rates, and customer review performance.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Total Enquiries */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Requests
            </span>
            <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              {analytics.totalEnquiries}
            </h3>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Completion Rate
            </span>
            <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              {analytics.completionRate}%
            </h3>
          </div>
        </div>

        {/* Card 3: Response Rate */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Response Rate
            </span>
            <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              {analytics.responseRate}%
            </h3>
          </div>
        </div>

        {/* Card 4: Average Rating */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Avg Rating ({analytics.totalReviews} reviews)
            </span>
            <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
              ⭐ {analytics.averageRating}
            </h3>
          </div>
        </div>
      </div>

      {/* Enquiry Status Breakdown Progress Bars */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
          Request Status Breakdown
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Completed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a' }}>
                <CheckCircle size={16} /> Completed Jobs
              </span>
              <span style={{ color: '#0f172a' }}>{analytics.completedCount} ({analytics.totalEnquiries > 0 ? Math.round((analytics.completedCount / analytics.totalEnquiries) * 100) : 0}%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${analytics.totalEnquiries > 0 ? (analytics.completedCount / analytics.totalEnquiries) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#16a34a',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Contacted / Accepted */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7' }}>
                <Clock size={16} /> In Progress / Accepted
              </span>
              <span style={{ color: '#0f172a' }}>{analytics.acceptedCount} ({analytics.totalEnquiries > 0 ? Math.round((analytics.acceptedCount / analytics.totalEnquiries) * 100) : 0}%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${analytics.totalEnquiries > 0 ? (analytics.acceptedCount / analytics.totalEnquiries) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#0284c7',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Pending */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706' }}>
                <Clock size={16} /> Pending Action
              </span>
              <span style={{ color: '#0f172a' }}>{analytics.pendingCount} ({analytics.totalEnquiries > 0 ? Math.round((analytics.pendingCount / analytics.totalEnquiries) * 100) : 0}%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${analytics.totalEnquiries > 0 ? (analytics.pendingCount / analytics.totalEnquiries) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#d97706',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Cancelled */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}>
                <XCircle size={16} /> Cancelled
              </span>
              <span style={{ color: '#0f172a' }}>{analytics.cancelledCount} ({analytics.totalEnquiries > 0 ? Math.round((analytics.cancelledCount / analytics.totalEnquiries) * 100) : 0}%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${analytics.totalEnquiries > 0 ? (analytics.cancelledCount / analytics.totalEnquiries) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#ef4444',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
