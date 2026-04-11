import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService, { type Campaign, type CampaignStatus } from '../services/campaignService';

function StatCard({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  delay: string;
}) {
  return (
    <div
      className={`cn-card animate-fade-up ${delay}`}
      style={{ padding: '20px 24px' }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '32px',
          fontWeight: 800,
          lineHeight: 1,
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
    </div>
  );
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: 'Draft', className: 'cn-badge cn-badge-draft' },
  IN_PROGRESS: { label: 'In Progress', className: 'cn-badge cn-badge-active' },
  SUBMITTED: { label: 'Submitted', className: 'cn-badge cn-badge-active' },
  APPROVED: { label: 'Approved', className: 'cn-badge cn-badge-active' },
  COMPLETED: { label: 'Completed', className: 'cn-badge cn-badge-completed' },
  CANCELLED: { label: 'Cancelled', className: 'cn-badge cn-badge-paused' },
};

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        border: active ? '1px solid rgba(240,165,0,0.12)' : '1px solid transparent',
        transition: 'all 0.18s ease',
      }}
    >
      {icon} {label}
    </Link>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  campaignService
    .list()
    .then(setCampaigns)
    .catch((err) => {
      console.error('Failed to load dashboard campaigns', err)
      setCampaigns([])
    })
    .finally(() => setLoading(false))
}, [])

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

    const stats = {
    total: campaigns.length,
    active: campaigns.filter(
        (c) => c.campaignStatus === 'IN_PROGRESS'
    ).length,
    draft: campaigns.filter(
        (c) => c.campaignStatus === 'DRAFT'
    ).length,
    budget: campaigns.reduce(
        (sum, c) => sum + Number(c.amount || 0),
        0
    ),
    };

  const recent = campaigns.slice(0, 5);

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logoWrap}>
            <div style={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
              </svg>
            </div>
            <span style={styles.logoText}>CollabNest</span>
          </div>

          <nav style={styles.nav}>
            <NavItem href="/dashboard" icon={<DashIcon />} label="Dashboard" active />
            <NavItem href="/campaigns" icon={<CampaignIcon />} label="Campaigns" />
            <NavItem href="/campaigns/new" icon={<PlusIcon />} label="New Campaign" />
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.userRow}>
            <div style={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: '6px',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={{ fontSize: '20px', marginBottom: '2px' }}>
              Good {greeting()},{' '}
              <span style={{ color: 'var(--accent)' }}>
                {user?.name}
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Here's what's happening across your campaigns
            </p>
          </div>
          <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none' }}>
            <PlusIcon /> New Campaign
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Campaigns" value={stats.total} delay="stagger-1" />
          <StatCard label="Active" value={stats.active} accent delay="stagger-2" />
          <StatCard label="Drafts" value={stats.draft} delay="stagger-3" />
          <StatCard
            label="Total Budget"
            value={`$${stats.budget.toLocaleString()}`}
            delay="stagger-4"
          />
        </div>

        {/* Recent campaigns */}
        <div className="cn-card animate-fade-up stagger-4" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px' }}>Recent Campaigns</h2>
            <Link to="/campaigns" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: '20px', borderRadius: '6px', width: i === 3 ? '60%' : '100%' }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No campaigns yet.</p>
              <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: '16px' }}>
                Create your first campaign
              </Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Campaign</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Budget</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      ...styles.tr,
                      borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                    }}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                  >
                    <td style={styles.td}>
                      <span style={{ fontWeight: 500 }}>{c.campaignName}</span>
                    </td>
                    <td style={styles.td}>
                      <span className={STATUS_CONFIG[c.campaignStatus].className}>
                        {STATUS_CONFIG[c.campaignStatus].label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>
                      ${Number(c.amount).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// Icons
const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const CampaignIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-base)',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 12px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarTop: { display: 'flex', flexDirection: 'column', gap: '24px' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '4px' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' },
  logoMark: {
    width: '30px', height: '30px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  avatar: {
    width: '30px', height: '30px',
    background: 'var(--accent-glow)',
    border: '1px solid rgba(240,165,0,0.3)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--accent)',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '13px',
    flexShrink: 0,
  },
  main: { flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px' },
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'var(--bg-elevated)' },
  th: { padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' },
  tr: { cursor: 'pointer', transition: 'background 0.15s ease' },
  td: { padding: '14px 24px', fontSize: '14px', color: 'var(--text-primary)' },
};