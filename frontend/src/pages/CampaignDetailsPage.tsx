import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import campaignService from '../services/campaignService';
import type { Campaign, CampaignStatus } from '../services/campaignService';
import { getDeadlineStatus } from '../utils/deadlineUtils';

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  HIGH:   { color: '#f87171', background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.2)' },
  MEDIUM: { color: '#f0a500', background: 'rgba(240,165,0,0.09)',   border: '1px solid rgba(240,165,0,0.2)' },
  LOW:    { color: '#34d399', background: 'rgba(52,211,153,0.09)',  border: '1px solid rgba(52,211,153,0.2)' },
};
const PAYMENT_STYLE: Record<string, React.CSSProperties> = {
  PAID:    { color: '#34d399', background: 'rgba(52,211,153,0.09)',  border: '1px solid rgba(52,211,153,0.2)' },
  PENDING: { color: '#f0a500', background: 'rgba(240,165,0,0.09)',   border: '1px solid rgba(240,165,0,0.2)' },
  OVERDUE: { color: '#f87171', background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.2)' },
};
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  DRAFT:       { color: '#94a3b8', background: 'rgba(148,163,184,0.09)', border: '1px solid rgba(148,163,184,0.2)' },
  IN_PROGRESS: { color: '#60a5fa', background: 'rgba(96,165,250,0.09)',  border: '1px solid rgba(96,165,250,0.2)'  },
  SUBMITTED:   { color: '#c084fc', background: 'rgba(192,132,252,0.09)', border: '1px solid rgba(192,132,252,0.2)' },
  APPROVED:    { color: '#34d399', background: 'rgba(52,211,153,0.09)',  border: '1px solid rgba(52,211,153,0.2)'  },
  COMPLETED:   { color: '#34d399', background: 'rgba(52,211,153,0.13)',  border: '1px solid rgba(52,211,153,0.3)'  },
  CANCELLED:   { color: '#f87171', background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.2)' },
};

const STATUS_OPTIONS = ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const;

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>{label}</p>
      <div style={{ fontSize: '14px', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function Badge({ value, styleMap }: { value: string; styleMap: Record<string, React.CSSProperties> }) {
  const s = styleMap[value] || { color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'capitalize', ...s }}>
      {value}
    </span>
  );
}

function StatusPill({
  value,
  disabled,
  onChange,
}: {
  value: CampaignStatus;
  disabled?: boolean;
  onChange: (next: CampaignStatus) => void;
}) {
  const s = STATUS_STYLE[value] || {
    color: 'var(--text-secondary)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as CampaignStatus)}
        title="Update campaign status"
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '3px 26px 3px 10px',
          borderRadius: '5px',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'Syne, sans-serif',
          letterSpacing: '0.06em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'opacity 0.15s',
          opacity: disabled ? 0.6 : 1,
          ...s,
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option
            key={opt}
            value={opt}
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {opt.replace('_', ' ')}
          </option>
        ))}
      </select>
      {disabled ? (
        /* spinner while saving */
        <svg
          width="9" height="9" viewBox="0 0 16 16" fill="none"
          style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: s.color as string, animation: 'spin 0.7s linear infinite' }}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      ) : (
        /* chevron */
        <svg
          width="9" height="9" viewBox="0 0 10 10" fill="none"
          style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: s.color as string }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>{icon} {label}</Link>;
}

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    campaignService.get(Number(id)).then(setCampaign).catch(() => setError('Campaign not found or failed to load.')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try { 
      await campaignService.delete(Number(id));
      showToast('Campaign deleted successfully!', 'success');
      navigate('/campaigns');
    }
    catch { 
      const message = 'Failed to delete campaign.';
      setError(message);
      setDeleting(false);
      setDeleteModal(false);
      showToast(message, 'error');
    }
  };

  const handleStatusChange = async (next: CampaignStatus) => {
    if (!id || !campaign) return;
    setStatusUpdating(true);
    try {
      await campaignService.update(Number(id), { campaignStatus: next });
      setCampaign((prev) => prev ? { ...prev, campaignStatus: next } : prev);
      showToast('Status updated successfully!', 'success');
    } catch {
      const message = 'Failed to update status.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

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
            <SideLink href="/dashboard" label="Dashboard" icon={<DashIcon />} />
            <SideLink href="/campaigns" label="Campaigns" icon={<CampaignIcon />} active />
            <SideLink href="/campaigns/new" label="New Campaign" icon={<PlusIcon />} />
          </nav>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="cn-user-row">
            <div className="cn-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
          </div>
          <button className="cn-logout-btn" onClick={handleLogout}><LogoutIcon /> Sign out</button>
        </div>
      </aside>

      <main className="cn-main">
        <div>
          <Link to="/campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
            <BackIcon /> Back to Campaigns
          </Link>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[140, 200, 160].map((h, i) => <div key={i} className="cn-card skeleton" style={{ height: `${h}px` }} />)}
          </div>
        )}

        {!loading && error && (
          <div className="cn-card" style={{ padding: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>⚠️</p>
            <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
            <Link to="/campaigns" className="cn-btn-ghost" style={{ textDecoration: 'none' }}>Back to Campaigns</Link>
          </div>
        )}

        {!loading && campaign && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-up">

            {/* Header */}
            <div className="cn-card" style={{ padding: '26px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '21px' }}>{campaign.campaignName}</h1>
                    {/* Inline editable status pill */}
                    <StatusPill
                      value={(campaign.campaignStatus as CampaignStatus) || 'DRAFT'}
                      disabled={statusUpdating}
                      onChange={handleStatusChange}
                    />
                    {campaign.priority && <Badge value={campaign.priority as string} styleMap={PRIORITY_STYLE} />}
                    {campaign.paymentStatus && <Badge value={campaign.paymentStatus as string} styleMap={PAYMENT_STYLE} />}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{campaign.brandName}</span>
                    {campaign.brandName && ' · '}
                    Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link to={`/campaigns/${id}/edit`} className="cn-btn-ghost" style={{ textDecoration: 'none' }}><EditIcon /> Edit</Link>
                  <button className="cn-btn-danger" onClick={() => setDeleteModal(true)}><TrashIcon /> Delete</button>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <SectionHeader label="Campaign Details" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <DetailRow label="Brand"        value={campaign.brandName} />
                  <DetailRow label="Platform"     value={campaign.platform} />
                  <DetailRow label="Content Type" value={campaign.contentType} />
                  <DetailRow label="Deadline" value={
                    campaign.deadline ? (
                      (() => {
                        const ds = getDeadlineStatus(campaign.deadline);
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 9px',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'Syne, sans-serif',
                            color: ds.color,
                            background: ds.background,
                            border: ds.border,
                          }}>
                            {new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        );
                      })()
                    ) : undefined
                  } />
                </div>
              </div>

              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <SectionHeader label="Financials" />
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>Amount</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    ${Number(campaign.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <DetailRow label="Payment"  value={campaign.paymentStatus} />
                  <DetailRow label="Priority" value={campaign.priority} />
                </div>
              </div>

              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <SectionHeader label="Contact" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <DetailRow label="Name" value={campaign.contactName} />
                  <DetailRow label="Email" value={campaign.contactEmail ? (
                    <a href={`mailto:${campaign.contactEmail}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{campaign.contactEmail}</a>
                  ) : undefined} />
                </div>
              </div>

              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <SectionHeader label="Notes" />
                <p style={{ fontSize: '14px', color: campaign.notes ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: '1.7', fontStyle: campaign.notes ? 'normal' : 'italic' }}>
                  {campaign.notes || 'No notes added.'}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="cn-card" style={{ padding: '14px 24px', display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
              <DetailRow label="Created"      value={new Date(campaign.createdAt).toLocaleString()} />
              {campaign.updatedAt && <DetailRow label="Last Updated" value={new Date(campaign.updatedAt).toLocaleString()} />}
            </div>
          </div>
        )}
      </main>

      {deleteModal && (
        <div className="cn-modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="cn-card-elevated cn-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', flexShrink: 0 }}>
                <TrashIcon />
              </div>
              <h3 style={{ fontSize: '16px' }}>Delete Campaign?</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.65', marginBottom: '24px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{campaign?.campaignName}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cn-btn-ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</button>
              <button className="cn-btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete Campaign'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EditIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TrashIcon    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M3.5 3.5l.75 8h5.5l.75-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;