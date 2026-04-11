import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService from '../services/campaignService';
import type { Campaign } from '../services/campaignService';
import CampaignForm from '../components/CampaignForm';
import type { CampaignFormData } from '../components/CampaignForm';

function campaignToFormData(c: Campaign): Partial<CampaignFormData> {
  return {
    brandName: (c.brandName as string) || '',
    campaignName: (c.campaignName as string) || '',
    platform: (c.platform as CampaignFormData['platform']) || '',
    contentType: (c.contentType as CampaignFormData['contentType']) || '',
    deadline: (c.deadline as string) || '',
    amount: Number(c.amount || 0),
    priority: (c.priority as CampaignFormData['priority']) || '',
    paymentStatus: (c.paymentStatus as CampaignFormData['paymentStatus']) || '',
    contactName: (c.contactName as string) || '',
    contactEmail: (c.contactEmail as string) || '',
    notes: (c.notes as string) || '',
  };
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    campaignService
      .get(Number(id))
      .then(setCampaign)
      .catch(() => setFetchError('Failed to load campaign.'))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleSubmit = async (data: CampaignFormData) => {
    if (!id) return;
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await campaignService.update(Number(id), {
        ...data,
        amount: Number(data.amount),
      });
      setSuccess(true);
      setTimeout(() => navigate(`/campaigns/${id}`), 800);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSubmitLoading(false);
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
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link to="/campaigns" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Campaigns</Link>
          <span>/</span>
          <Link to={`/campaigns/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {campaign?.campaignName || `#${id}`}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Edit</span>
        </div>

        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Edit Campaign</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Update the details for this campaign
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '10px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.25)',
            color: '#34d399', fontSize: '14px', fontWeight: 500,
          }}>
            <CheckIcon /> Campaign updated successfully! Redirecting…
          </div>
        )}

        {/* Fetch loading */}
        {fetchLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="cn-card skeleton" style={{ height: '160px' }} />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!fetchLoading && fetchError && (
          <div className="cn-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
            <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{fetchError}</p>
            <Link to="/campaigns" className="cn-btn-ghost" style={{ textDecoration: 'none' }}>
              Back to Campaigns
            </Link>
          </div>
        )}

        {/* Form */}
        {!fetchLoading && campaign && !fetchError && (
          <CampaignForm
            mode="edit"
            initialData={campaignToFormData(campaign)}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/campaigns/${id}`)}
            loading={submitLoading}
            error={submitError}
          />
        )}
      </main>
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

const DashIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>;
const CampaignIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },
  sidebar: { width: '220px', flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 12px', position: 'sticky', top: 0, height: '100vh' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' },
  logoMark: { width: '30px', height: '30px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '4px' },
  avatar: { width: '28px', height: '28px', background: 'var(--accent-glow)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', flexShrink: 0 },
  logoutBtn: { width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' },
};