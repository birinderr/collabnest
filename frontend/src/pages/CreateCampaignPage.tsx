import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import campaignService, { type CreateCampaignData } from '../services/campaignService';
import apiClient from '../services/apiClient';

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>
      {icon} {label}
    </Link>
  );
}

// Shape of each campaign returned by the AI parse endpoint
interface ParsedCampaign {
  brandName: string;
  campaignName: string;
  platform: string;
  contentType: string;
  deadline: string;
  amount: number;
  notes: string;
}

interface ParseBriefResponse {
  campaigns: ParsedCampaign[];
}

export default function CreateCampaignPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  // ── Manual mode state ──────────────────────────────────────────
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

  // ── AI mode state ──────────────────────────────────────────────
  const [aiText, setAiText] = useState('');
  const [parsedCampaigns, setParsedCampaigns] = useState<ParsedCampaign[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  const set = (k: keyof CreateCampaignData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  // ── Manual submit ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.brandName.trim())           { setError('Brand name is required'); return; }
    if (!form.campaignName.trim())        { setError('Campaign name is required'); return; }
    if (!form.platform)                   { setError('Platform is required'); return; }
    if (!form.contentType)                { setError('Content type is required'); return; }
    if (!form.deadline)                   { setError('Deadline is required'); return; }
    if (!form.amount || form.amount <= 0) { setError('Amount must be a positive number'); return; }

    setLoading(true);
    try {
      await campaignService.create(form);
      showToast('Campaign created successfully!', 'success');
      navigate('/campaigns');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── AI parse ───────────────────────────────────────────────────
  const handleParseBrief = async () => {
    if (!aiText.trim()) {
      setAiError('Please paste some text before parsing.');
      return;
    }
    setAiError('');
    setParsedCampaigns([]);
    setAiLoading(true);
    try {
      const result = await apiClient.post<ParseBriefResponse>('/api/ai/parse-brief', { text: aiText });
      if (!result.campaigns || result.campaigns.length === 0) {
        setAiError('No campaigns could be extracted. Try adding more detail to your brief.');
      } else {
        setParsedCampaigns(result.campaigns);
        showToast(`${result.campaigns.length} campaign${result.campaigns.length > 1 ? 's' : ''} extracted!`, 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse brief';
      setAiError(message);
      showToast(message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Bulk save ──────────────────────────────────────────────────
  const handleBulkSave = async () => {
    setBulkSaving(true);

    try {
      const normalizedCampaigns = parsedCampaigns.map((campaign) => ({
        ...campaign,
        platform: campaign.platform?.toUpperCase(),
        contentType: campaign.contentType?.toUpperCase(),
      }));

      await apiClient.post('/api/campaigns/bulk', {
        campaigns: normalizedCampaigns,
      });

      showToast(
        `${parsedCampaigns.length} campaign${parsedCampaigns.length > 1 ? 's' : ''} created successfully!`,
        'success'
      );

      navigate('/campaigns');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save campaigns';

      showToast(message, 'error');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const tips = [
    { icon: '🎯', title: 'Be specific',     desc: 'Clear campaign names help you track work faster.' },
    { icon: '📅', title: 'Set a deadline',  desc: 'Deadlines keep deliverables on schedule.' },
    { icon: '💰', title: 'Accurate amount', desc: 'Log the agreed amount for budget tracking.' },
  ];

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
            <SideLink href="/campaigns"     label="Campaigns"    icon={<CampaignIcon />} />
            <SideLink href="/campaigns/new" label="New Campaign" icon={<PlusIcon />} active />
          </nav>
        </div>
        <div className="cn-sidebar-footer">
          <div className="cn-user-row">
            <div className="cn-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
          </div>
          <button className="cn-logout-btn" onClick={handleLogout}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      <main className="cn-main">
        {/* Breadcrumb */}
        <div>
          <Link to="/campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
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

        {/* ── Mode tabs ── */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '4px',
          gap: '4px',
          alignSelf: 'flex-start',
        }}>
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'Syne, sans-serif',
              fontWeight: mode === 'manual' ? 700 : 500,
              background: mode === 'manual' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'manual' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'manual' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <EditTabIcon /> Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'Syne, sans-serif',
              fontWeight: mode === 'ai' ? 700 : 500,
              background: mode === 'ai' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'ai' ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: mode === 'ai' ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(240,165,0,0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <SparkleIcon /> AI Import
          </button>
        </div>

        {/* ── Manual mode ── */}
        {mode === 'manual' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cn-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p className="cn-section-label">Campaign Details</p>

                <div>
                  <label className="cn-label">Brand Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input className="cn-input" type="text" placeholder="e.g. Nike" value={form.brandName} onChange={set('brandName')} required disabled={loading} maxLength={200} />
                </div>

                <div>
                  <label className="cn-label">Campaign Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input className="cn-input" type="text" placeholder="e.g. Summer Collection 2025" value={form.campaignName} onChange={set('campaignName')} required disabled={loading} maxLength={200} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="cn-label">Platform <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <select className="cn-input" value={form.platform} onChange={set('platform')} required disabled={loading}>
                      <option value="">Select platform</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="X">X (Twitter)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cn-label">Content Type <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <select className="cn-input" value={form.contentType} onChange={set('contentType')} required disabled={loading}>
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

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="cn-label">Deadline <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <input className="cn-input" type="date" value={form.deadline} onChange={set('deadline')} required disabled={loading} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cn-label">Amount <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none' }}>$</span>
                      <input className="cn-input" type="number" placeholder="0.00" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required disabled={loading} min="0" step="0.01" style={{ paddingLeft: '26px' }} />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="cn-error-msg" style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.06)', borderRadius: '9px', border: '1px solid rgba(248,113,113,0.15)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                    </svg>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button type="submit" className="cn-btn-primary" disabled={loading} style={{ flex: 1 }}>
                    {loading ? (
                      <>
                        <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(13,15,20,0.3)', borderTopColor: '#0d0f14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Creating…
                      </>
                    ) : 'Create Campaign'}
                  </button>
                  <Link to="/campaigns" className="cn-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ width: '256px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="cn-preview-card">
                <p className="cn-preview-card-header">💡 Tips</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {tips.map((tip) => (
                    <div key={tip.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>{tip.icon}</span>
                      <div>
                        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{tip.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cn-preview-card" style={{ background: 'rgba(240,165,0,0.03)', borderColor: 'rgba(240,165,0,0.12)' }}>
                <p className="cn-preview-card-header" style={{ color: 'var(--accent)', borderBottomColor: 'rgba(240,165,0,0.12)' }}>
                  ⚡ Quick note
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.65' }}>
                  Contact info, priority, and payment status can be added after creating from the edit page.
                </p>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
                Fields marked <span style={{ color: 'var(--accent)' }}>*</span> are required
              </p>
            </div>
          </form>
        )}

        {/* ── AI Import mode ── */}
        {mode === 'ai' && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Input card */}
              <div className="cn-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0,
                  }}>
                    <SparkleIcon size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>AI Campaign Import</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paste a brief and let AI extract campaign details</p>
                  </div>
                </div>

                <div>
                  <label className="cn-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Paste your campaign brief
                  </label>
                  <textarea
                    className="cn-input"
                    placeholder={`e.g. "Nike wants a 30-second Instagram Reel for their Summer Drop campaign. Budget is $8,000. Deadline April 30. Contact: Sarah at sarah@nike.com"`}
                    rows={6}
                    value={aiText}
                    onChange={(e) => { setAiText(e.target.value); setAiError(''); }}
                    style={{ resize: 'vertical', lineHeight: '1.6' }}
                    disabled={aiLoading}
                  />
                </div>

                {aiError && (
                  <p className="cn-error-msg" style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.06)', borderRadius: '9px', border: '1px solid rgba(248,113,113,0.15)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                    </svg>
                    {aiError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleParseBrief}
                  disabled={aiLoading || !aiText.trim()}
                  className="cn-btn-primary"
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: aiLoading || !aiText.trim() ? 0.6 : 1,
                    cursor: aiLoading || !aiText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(13,15,20,0.3)', borderTopColor: '#0d0f14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Parsing…
                    </>
                  ) : (
                    <>
                      <SparkleIcon size={13} />
                      Parse with AI
                    </>
                  )}
                </button>
              </div>

              {/* Parsed results */}
              {parsedCampaigns.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    {parsedCampaigns.length} Campaign{parsedCampaigns.length > 1 ? 's' : ''} Extracted
                  </p>
                  {parsedCampaigns.map((c, i) => (
                    <div
                      key={i}
                      className="cn-card"
                      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      {/* Card header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {c.campaignName || '—'}
                          </p>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{c.brandName || '—'}</p>
                        </div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '20px',
                          background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.15)',
                          color: 'var(--accent)', fontSize: '11px', fontWeight: 700,
                          fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
                          flexShrink: 0,
                        }}>
                          <SparkleIcon size={10} /> AI
                        </span>
                      </div>

                      {/* Fields grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Platform',     value: c.platform },
                          { label: 'Content Type', value: c.contentType },
                          { label: 'Deadline',     value: c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                          { label: 'Amount',       value: c.amount ? `$${Number(c.amount).toLocaleString()}` : '—' },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
                            <p style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {c.notes && (
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes</p>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.55' }}>{c.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Bulk save CTA ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {parsedCampaigns.length} campaign{parsedCampaigns.length > 1 ? 's' : ''} ready to save
                  </p>
                  <button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={bulkSaving}
                    className="cn-btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: bulkSaving ? 0.7 : 1,
                      cursor: bulkSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {bulkSaving ? (
                      <>
                        <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(13,15,20,0.3)', borderTopColor: '#0d0f14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        Create {parsedCampaigns.length} Campaign{parsedCampaigns.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </>
              )}
            </div>

            {/* Right column */}
            <div style={{ width: '256px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="cn-preview-card">
                <p className="cn-preview-card-header">🤖 How it works</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { step: '1', title: 'Paste brief',   desc: 'Drop in any text — email, doc, or note.' },
                    { step: '2', title: 'AI extracts',   desc: 'Fields are detected and filled automatically.' },
                    { step: '3', title: 'Review & save', desc: 'Check the cards, then save your campaigns.' },
                  ].map((item) => (
                    <div key={item.step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '10px', fontWeight: 800,
                        fontFamily: 'Syne, sans-serif', color: 'var(--accent)', marginTop: '1px',
                      }}>
                        {item.step}
                      </div>
                      <div>
                        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cn-preview-card" style={{ background: 'rgba(240,165,0,0.03)', borderColor: 'rgba(240,165,0,0.12)' }}>
                <p className="cn-preview-card-header" style={{ color: 'var(--accent)', borderBottomColor: 'rgba(240,165,0,0.12)' }}>
                  ⚡ Quick note
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.65' }}>
                  AI Import will support PDF briefs, email threads, and voice notes in future updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EditTabIcon  = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SparkleIcon  = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.5 3.5l2 2M10.5 10.5l2 2M10.5 3.5l-2 2M5.5 10.5l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);