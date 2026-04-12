import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import campaignService from '../services/campaignService';
import type { Campaign } from '../services/campaignService';
import CampaignForm from '../components/CampaignForm';
import type { CampaignFormData } from '../components/CampaignForm';

function campaignToFormData(c: Campaign): Partial<CampaignFormData> {
  return {
    brandName:     (c.brandName as string)     || '',
    campaignName:  (c.campaignName as string)  || '',
    platform:      (c.platform as CampaignFormData['platform'])       || '',
    contentType:   (c.contentType as CampaignFormData['contentType']) || '',
    deadline:      (c.deadline as string)      || '',
    amount:        Number(c.amount || 0),
    priority:      (c.priority as CampaignFormData['priority'])           || '',
    paymentStatus: (c.paymentStatus as CampaignFormData['paymentStatus']) || '',
    contactName:   (c.contactName as string)   || '',
    contactEmail:  (c.contactEmail as string)  || '',
    notes:         (c.notes as string)         || '',
  };
}

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>
      {icon} {label}
    </Link>
  );
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign]       = useState<Campaign | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]   = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess]         = useState(false);

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
      showToast('Campaign updated successfully!', 'success');
      setTimeout(() => navigate(`/campaigns/${id}`), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save changes.';
      setSubmitError(message);
      showToast(message, 'error');
    } finally {
      setSubmitLoading(false);
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
                <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill="var(--accent)" />
                <rect x="11" y="2"  width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="2"  y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
              </svg>
            </div>
            <span className="cn-logo-text">CollabNest</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <SideLink href="/dashboard"     label="Dashboard"    icon={<DashIcon />} />
            <SideLink href="/campaigns"     label="Campaigns"    icon={<CampaignIcon />} active />
            <SideLink href="/campaigns/new" label="New Campaign" icon={<PlusIcon />} />
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="cn-user-row">
            <div className="cn-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
          </div>
          <button className="cn-logout-btn" onClick={handleLogout}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      <main className="cn-main" style={{ maxWidth: '860px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link to="/campaigns" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Campaigns
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link to={`/campaigns/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {campaign?.campaignName || `#${id}`}
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Edit</span>
        </div>

        {/* Page title */}
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Edit Campaign</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Update the details for this campaign
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(52,211,153,0.07)',
            border: '1px solid rgba(52,211,153,0.22)',
            color: '#34d399',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            <CheckIcon /> Campaign updated successfully! Redirecting…
          </div>
        )}

        {/* Fetch loading skeletons */}
        {fetchLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[180, 140, 100].map((h, i) => (
              <div key={i} className="cn-card skeleton" style={{ height: `${h}px` }} />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!fetchLoading && fetchError && (
          <div className="cn-card" style={{ padding: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>⚠️</p>
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

const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon    = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;