import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService, { type CreateCampaignData } from '../services/campaignService';

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>
      {icon} {label}
    </Link>
  );
}

export default function CreateCampaignPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateCampaignData>({
    brandName: '',
    campaignName: '',
    platform: '',
    contentType: '',
    deadline: '',
    amount: 0,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof CreateCampaignData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!form.brandName.trim())   { setError('Brand name is required'); return; }
    if (!form.campaignName.trim()){ setError('Campaign name is required'); return; }
    if (!form.platform)           { setError('Platform is required'); return; }
    if (!form.contentType)        { setError('Content type is required'); return; }
    if (!form.deadline)           { setError('Deadline is required'); return; }
    if (!form.amount || form.amount <= 0) { setError('Amount must be a positive number'); return; }

    setLoading(true);
    try {
      await campaignService.create(form);
      navigate('/campaigns');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
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
            <SideLink href="/dashboard"    label="Dashboard"    icon={<DashIcon />} />
            <SideLink href="/campaigns"    label="Campaigns"    icon={<CampaignIcon />} />
            <SideLink href="/campaigns/new" label="New Campaign" icon={<PlusIcon />} active />
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

      <main className="cn-main" style={{ maxWidth: '900px' }}>
        {/* Breadcrumb */}
        <div>
          <Link
            to="/campaigns"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}
          >
            <BackIcon /> Campaigns
          </Link>
        </div>

        {/* Page title */}
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Create Campaign</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Fill in the details to launch your next campaign
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Main column */}
          <div style={styles.formMain}>
            <div className="cn-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p className="cn-section-label">Campaign Details</p>

              <div>
                <label className="cn-label">
                  Brand Name <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  className="cn-input"
                  type="text"
                  placeholder="e.g. Nike"
                  value={form.brandName}
                  onChange={set('brandName')}
                  required
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="cn-label">
                  Campaign Name <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  className="cn-input"
                  type="text"
                  placeholder="e.g. Summer Collection 2025"
                  value={form.campaignName}
                  onChange={set('campaignName')}
                  required
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label className="cn-label">
                    Platform <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <select
                    className="cn-input"
                    value={form.platform}
                    onChange={set('platform')}
                    required
                    disabled={loading}
                  >
                    <option value="">Select platform</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="X">X (Twitter)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="cn-label">
                    Content Type <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <select
                    className="cn-input"
                    value={form.contentType}
                    onChange={set('contentType')}
                    required
                    disabled={loading}
                  >
                    <option value="">Select content type</option>
                    <option value="REEL">Reel</option>
                    <option value="POST">Post</option>
                    <option value="STORY">Story</option>
                    <option value="SHORT">Short</option>
                    <option value="VIDEO">Video</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label className="cn-label">
                    Deadline <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    className="cn-input"
                    type="date"
                    value={form.deadline}
                    onChange={set('deadline')}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="cn-label">
                    Amount <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none' }}>
                      $
                    </span>
                    <input
                      className="cn-input"
                      type="number"
                      placeholder="0.00"
                      value={form.amount || ''}
                      onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                      required
                      disabled={loading}
                      min="0"
                      step="0.01"
                      style={{ paddingLeft: '26px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="cn-error-msg"
                style={{
                  padding: '12px 16px',
                  background: 'rgba(248,113,113,0.06)',
                  borderRadius: '9px',
                  border: '1px solid rgba(248,113,113,0.15)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                </svg>
                {error}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="cn-btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
                    Creating…
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
              <Link to="/campaigns" className="cn-btn-ghost" style={{ textDecoration: 'none' }}>
                Cancel
              </Link>
            </div>
          </div>

          {/* Side column — reserved for future fields */}
          <div style={styles.formSide} />
        </form>
      </main>
    </div>
  );
}

const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const styles: Record<string, React.CSSProperties> = {
  form:     { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  formMain: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  formSide: { width: '220px', flexShrink: 0 },
  row:      { display: 'flex', gap: '12px' },
  spinner:  { display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(13,15,20,0.3)', borderTopColor: '#0d0f14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
};