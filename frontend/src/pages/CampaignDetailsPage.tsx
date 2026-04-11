import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService from '../services/campaignService';
import type { Campaign } from '../services/campaignService';

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  HIGH: { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' },
  MEDIUM: { color: '#f0a500', background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' },
  LOW: { color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' },
};

const PAYMENT_STYLE: Record<string, React.CSSProperties> = {
  PAID: { color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' },
  PENDING: { color: '#f0a500', background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' },
  OVERDUE: { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' },
};

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </p>
    </div>
  );
}

function Badge({ value, styleMap }: { value: string; styleMap: Record<string, React.CSSProperties> }) {
  const s = styleMap[value] || { color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 700,
      fontFamily: 'Syne, sans-serif',
      letterSpacing: '0.05em',
      textTransform: 'capitalize',
      ...s,
    }}>
      {value}
    </span>
  );
}

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    campaignService
      .get(Number(id))
      .then(setCampaign)
      .catch(() => setError('Campaign not found or failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await campaignService.delete(Number(id));
      navigate('/campaigns');
    } catch {
      setError('Failed to delete campaign.');
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <SideLink href="/dashboard" label="Dashboard" icon={<DashIcon />} />
            <SideLink href="/campaigns" label="Campaigns" icon={<CampaignIcon />} active />
            <SideLink href="/campaigns/new" label="New Campaign" icon={<PlusIcon />} />
          </nav>
        </div>
        <div>
          <div style={styles.userRow}>
            <div style={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/campaigns"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.15s' }}
          >
            <BackIcon /> Back to Campaigns
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="cn-card skeleton" style={{ height: '120px' }} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="cn-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
            <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
            <Link to="/campaigns" className="cn-btn-ghost" style={{ textDecoration: 'none' }}>
              Back to Campaigns
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && campaign && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-up">

            {/* Header card */}
            <div className="cn-card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '22px' }}>{campaign.campaignName || campaign.campaignName}</h1>
                    {campaign.priority && <Badge value={campaign.priority as string} styleMap={PRIORITY_STYLE} />}
                    {campaign.paymentStatus && <Badge value={campaign.paymentStatus as string} styleMap={PAYMENT_STYLE} />}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {campaign.brandName || '—'} · Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <Link
                    to={`/campaigns/${id}/edit`}
                    className="cn-btn-ghost"
                    style={{ textDecoration: 'none' }}
                  >
                    <EditIcon /> Edit
                  </Link>
                  <button className="cn-btn-danger" onClick={() => setDeleteModal(true)}>
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Campaign Details */}
              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SectionHeader label="Campaign Details" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <DetailRow label="Brand" value={campaign.brandName} />
                  <DetailRow label="Platform" value={campaign.platform} />
                  <DetailRow label="Content Type" value={campaign.contentType} />
                  <DetailRow label="Deadline" value={campaign.deadline ? new Date(campaign.deadline as string).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined} />
                </div>
              </div>

              {/* Financials */}
              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SectionHeader label="Financials" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif', marginBottom: '6px' }}>
                      Amount
                    </p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>
                      ${Number(campaign.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <DetailRow label="Payment" value={campaign.paymentStatus} />
                    <DetailRow label="Priority" value={campaign.priority} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SectionHeader label="Contact" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <DetailRow label="Name" value={campaign.contactName} />
                  <DetailRow
                    label="Email"
                    value={
                      campaign.contactEmail ? (
                        <a href={`mailto:${campaign.contactEmail}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                          {campaign.contactEmail}
                        </a>
                      ) : undefined
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="cn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SectionHeader label="Notes" />
                <p style={{ fontSize: '14px', color: campaign.notes ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: '1.7', fontStyle: campaign.notes ? 'normal' : 'italic' }}>
                  {campaign.notes || 'No notes added.'}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="cn-card" style={{ padding: '16px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <DetailRow label="Created" value={new Date(campaign.createdAt).toLocaleString()} />
              {campaign.updatedAt && <DetailRow label="Last Updated" value={new Date(campaign.updatedAt).toLocaleString()} />}
            </div>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteModal && (
        <div style={styles.modalOverlay} onClick={() => setDeleteModal(false)}>
          <div className="cn-card-elevated" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                <TrashIcon />
              </div>
              <h3 style={{ fontSize: '17px' }}>Delete Campaign?</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{campaign?.campaignName}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cn-btn-ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="cn-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
        {label}
      </p>
    </div>
  );
}

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link to={href} style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px',
      textDecoration: 'none', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      background: active ? 'var(--accent-subtle)' : 'transparent',
      border: active ? '1px solid rgba(240,165,0,0.12)' : '1px solid transparent',
      transition: 'all 0.18s ease',
    }}>
      {icon} {label}
    </Link>
  );
}

// Icons
const DashIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>;
const CampaignIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const BackIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M3.5 3.5l.75 8h5.5l.75-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },
  sidebar: { width: '220px', flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 12px', position: 'sticky', top: 0, height: '100vh' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' },
  logoMark: { width: '30px', height: '30px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '4px' },
  avatar: { width: '28px', height: '28px', background: 'var(--accent-glow)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', flexShrink: 0 },
  logoutBtn: { width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' },
  modal: { width: '100%', maxWidth: '420px', padding: '28px' },
};