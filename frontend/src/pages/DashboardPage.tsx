import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import campaignService, { type Campaign, type CampaignStatus } from '../services/campaignService';
import BackgroundParticles from '../components/BackgroundParticles';

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

const CHART_CONFIG = [
  { key: 'DRAFT',       label: 'Draft',       color: '#353b4e' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#f0a500' },
  { key: 'SUBMITTED',   label: 'Submitted',   color: '#60a5fa' },
  { key: 'APPROVED',    label: 'Approved',    color: '#a78bfa' },
  { key: 'COMPLETED',   label: 'Completed',   color: '#34d399' },
  { key: 'CANCELLED',   label: 'Cancelled',   color: '#f87171' },
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.payload.color, flexShrink: 0 }} />
        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginLeft: '4px' }}>
          {item.value}
        </span>
      </div>
    </div>
  );
}

function CampaignStatusChart({ campaigns }: { campaigns: Campaign[] }) {
  const data = CHART_CONFIG
    .map((cfg) => ({
      name: cfg.label,
      value: campaigns.filter((c) => c.campaignStatus === cfg.key).length,
      color: cfg.color,
    }))
    .filter((d) => d.value > 0);

  const total = campaigns.length;

  if (total === 0) return null;

  return (
    <div className="cn-card animate-fade-up stagger-3" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '15px', marginBottom: '2px' }}>Status Breakdown</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Distribution across {total} campaign{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* Donut chart */}
        <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '26px',
              fontWeight: 800,
              lineHeight: 1,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}>
              {total}
            </p>
            <p style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'Syne, sans-serif',
              marginTop: '3px',
            }}>
              Total
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px 32px',
          flex: 1,
          minWidth: '200px',
        }}>
          {CHART_CONFIG.map((cfg) => {
            const count = campaigns.filter((c) => c.campaignStatus === cfg.key).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: cfg.color,
                  flexShrink: 0,
                  opacity: count === 0 ? 0.3 : 1,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{
                      fontSize: '12.5px',
                      color: count === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: count === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}>
                      {count}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{
                    height: '3px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '2px',
                    marginTop: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: cfg.color,
                      borderRadius: '2px',
                      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                      opacity: count === 0 ? 0 : 0.8,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
        <BackgroundParticles />
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
            <NavItem href="/dashboard"     icon={<DashIcon />}     label="Dashboard"    active />
            <NavItem href="/campaigns"     icon={<CampaignIcon />} label="Campaigns" />
            <NavItem href="/campaigns/new" icon={<PlusIcon />}     label="New Campaign" />
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

      <main className="cn-main">
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
          <StatCard label="Total"  value={stats.total}                          delay="stagger-1" />
          <StatCard label="Active" value={stats.active} accent                  delay="stagger-2" />
          <StatCard label="Drafts" value={stats.draft}                          delay="stagger-3" />
          <StatCard label="Budget" value={`$${stats.budget.toLocaleString()}`}  delay="stagger-4" />
        </div>

        {/* ── Chart section — only renders when there's data ── */}
        {!loading && campaigns.length > 0 && (
          <CampaignStatusChart campaigns={campaigns} />
        )}

        {/* Recent campaigns */}
        <div className="cn-card animate-fade-up stagger-4" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                Create your first campaign to get started
              </p>
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
                    <td>
                      <span className={STATUS_CONFIG[c.campaignStatus].className}>
                        {STATUS_CONFIG[c.campaignStatus].label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>${Number(c.amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
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

const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;