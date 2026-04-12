import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService, { type Campaign } from '../services/campaignService';
import { getDeadlineStatus } from '../utils/deadlineUtils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:       { label: 'Draft',       className: 'cn-badge cn-badge-draft' },
  IN_PROGRESS: { label: 'In Progress', className: 'cn-badge cn-badge-active' },
  SUBMITTED:   { label: 'Submitted',   className: 'cn-badge cn-badge-paused' },
  APPROVED:    { label: 'Approved',    className: 'cn-badge cn-badge-completed' },
  COMPLETED:   { label: 'Completed',   className: 'cn-badge cn-badge-completed' },
  CANCELLED:   { label: 'Cancelled',   className: 'cn-badge cn-badge-paused' },
};

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`}>
      {icon} {label}
    </Link>
  );
}

export default function CampaignsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const PAGE_SIZE = 10;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const list = await campaignService.list();
      setCampaigns(list);
      setTotalCount(list.length);
    } catch {
      setError('Failed to load campaigns');
      setCampaigns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await campaignService.delete(deleteId);
      setDeleteId(null);
      fetchCampaigns();
    } catch {
      setError('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filtered = campaigns.filter((c) => {
    const matchSearch = !search || c.campaignName?.toLowerCase().includes(search.toLowerCase()) || c.brandName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.campaignStatus === statusFilter;
    return matchSearch && matchStatus;
  });

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', marginBottom: '3px' }}>Campaigns</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{totalCount} total</p>
          </div>
          <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none' }}>
            <PlusIcon /> New Campaign
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
              <SearchIcon />
            </span>
            <input
              className="cn-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                style={{
                  padding: '8px 13px',
                  borderRadius: '7px',
                  border: '1px solid',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: statusFilter === s.value ? 600 : 400,
                  background: statusFilter === s.value ? 'var(--accent-subtle)' : 'transparent',
                  borderColor: statusFilter === s.value ? 'rgba(240,165,0,0.28)' : 'var(--border)',
                  color: statusFilter === s.value ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="cn-error-msg">{error}</p>}

        {/* Table card */}
        <div className="cn-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {[100, 80, 100, 60].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '16px', width: `${w}%` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>No campaigns found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                {search ? 'Try a different search term' : 'Create your first campaign to get started'}
              </p>
              {!search && (
                <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                  Create Campaign
                </Link>
              )}
            </div>
          ) : (
            <table className="cn-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Amount</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const deadlineStatus = getDeadlineStatus(c.deadline);
                  return (
                    <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)}>
                      <td>
                        <p style={{ fontWeight: 500, marginBottom: '1px' }}>{c.brandName} — {c.campaignName}</p>
                      </td>
                      <td><span className={STATUS_CONFIG[c.campaignStatus]?.className || 'cn-badge cn-badge-draft'}>{STATUS_CONFIG[c.campaignStatus]?.label || c.campaignStatus}</span></td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          fontFamily: 'Syne, sans-serif',
                          ...deadlineStatus,
                        }}>
                          {c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>${Number(c.amount).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                          className="cn-btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="cn-btn-ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '8px 14px', fontSize: '13px' }}>← Prev</button>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '0 4px' }}>Page {page} of {totalPages}</span>
            <button className="cn-btn-ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: '8px 14px', fontSize: '13px' }}>Next →</button>
          </div>
        )}
      </main>

      {/* Delete modal */}
      {deleteId !== null && (
        <div className="cn-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="cn-card-elevated cn-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Delete Campaign?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              This action cannot be undone. The campaign and all its data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cn-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="cn-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
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
const SearchIcon   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;