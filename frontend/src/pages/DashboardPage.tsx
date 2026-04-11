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
    <div className={`cn-card animate-fade-up ${delay}`} style={{ padding: '22px 24px' }}>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        fontFamily: 'Syne, sans-serif',
        marginBottom: '10px',
      }}>
        {label}
      </p>
      <p className="cn-stat-value" style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  DRAFT:       { label: 'Draft',       className: 'cn-badge cn-badge-draft' },
  IN_PROGRESS: { label: 'In Progress', className: 'cn-badge cn-badge-active' },
  SUBMITTED:   { label: 'Submitted',   className: 'cn-badge cn-badge-active' },
  APPROVED:    { label: 'Approved',    className: 'cn-badge cn-badge-active' },
  COMPLETED:   { label: 'Completed',   className: 'cn-badge cn-badge-completed' },
  CANCELLED:   { label: 'Cancelled',   className: 'cn-badge cn-badge-paused' },
};

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>
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
    campaignService.list()
      .then(setCampaigns)
      .catch((err) => { console.error('Failed to load dashboard campaigns', err); setCampaigns([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const stats = {
    total:  campaigns.length,
    active: campaigns.filter((c) => c.campaignStatus === 'IN_PROGRESS').length,
    draft:  campaigns.filter((c) => c.campaignStatus === 'DRAFT').length,
    budget: campaigns.reduce((sum, c) => sum + Number(c.amount || 0), 0),
  };

  const recent = campaigns.slice(0, 5);

  return (
    <div className="cn-page">
      <aside className="cn-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="cn-logo-wrap">
            <div className="cn-logo-mark">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
              </svg>
            </div>
            <span className="cn-logo-text">CollabNest</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <NavItem href="/dashboard" icon={<DashIcon />} label="Dashboard" active />
            <NavItem href="/campaigns" icon={<CampaignIcon />} label="Campaigns" />
            <NavItem href="/campaigns/new" icon={<PlusIcon />} label="New Campaign" />
          </nav>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="cn-user-row">
            <div className="cn-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button className="cn-logout-btn" onClick={handleLogout}><LogoutIcon /> Sign out</button>
        </div>
      </aside>

      <main className="cn-main" style={{ maxWidth: '1000px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '21px', marginBottom: '3px' }}>
              Good {greeting()},{' '}
              <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <StatCard label="Total"    value={stats.total}  delay="stagger-1" />
          <StatCard label="Active"   value={stats.active} accent delay="stagger-2" />
          <StatCard label="Drafts"   value={stats.draft}  delay="stagger-3" />
          <StatCard label="Budget"   value={`$${stats.budget.toLocaleString()}`} delay="stagger-4" />
        </div>

        {/* Recent campaigns */}
        <div className="cn-card animate-fade-up stagger-4" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '15px' }}>Recent Campaigns</h2>
            <Link to="/campaigns" style={{ fontSize: '12.5px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[100, 100, 60].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '16px', width: `${w}%` }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>No campaigns yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Create your first campaign to get started</p>
              <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Create your first campaign
              </Link>
            </div>
          ) : (
            <table className="cn-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td><span style={{ fontWeight: 500 }}>{c.campaignName}</span></td>
                    <td><span className={STATUS_CONFIG[c.campaignStatus].className}>{STATUS_CONFIG[c.campaignStatus].label}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>${Number(c.amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
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

const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;