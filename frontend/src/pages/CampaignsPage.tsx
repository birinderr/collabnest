import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campaignService, { type Campaign } from '../services/campaignService.ts';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'cn-badge cn-badge-draft' },
  IN_PROGRESS: { label: 'In Progress', className: 'cn-badge cn-badge-active' },
  SUBMITTED: { label: 'Submitted', className: 'cn-badge cn-badge-paused' },
  APPROVED: { label: 'Approved', className: 'cn-badge cn-badge-completed' },
  COMPLETED: { label: 'Completed', className: 'cn-badge cn-badge-completed' },
  CANCELLED: { label: 'Cancelled', className: 'cn-badge cn-badge-paused' },
};

const STATUSES: Array<{ value: string; label: string }> = [
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
    <Link to={href} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', borderRadius: '8px',
      textDecoration: 'none', fontSize: '14px',
      fontWeight: active ? 600 : 400,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      background: active ? 'var(--accent-subtle)' : 'transparent',
      border: active ? '1px solid rgba(240,165,0,0.12)' : '1px solid transparent',
      transition: 'all 0.18s ease',
    }}>
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
    const campaignList = await campaignService.list();

    setCampaigns(campaignList);
    setTotalCount(campaignList.length);
  } catch {
    setError('Failed to load campaigns');
    setCampaigns([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Campaigns</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{totalCount} total</p>
          </div>
          <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none' }}>
            <PlusIcon /> New Campaign
          </Link>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input
              className="cn-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: statusFilter === s.value ? 600 : 400,
                  background: statusFilter === s.value ? 'var(--accent-subtle)' : 'transparent',
                  borderColor: statusFilter === s.value ? 'rgba(240,165,0,0.3)' : 'var(--border)',
                  color: statusFilter === s.value ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="cn-error-msg">{error}</p>}

        {/* Table */}
        <div className="cn-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: '18px', width: i % 2 === 0 ? '80%' : '100%' }} />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>No campaigns found</p>
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
            <table style={styles.table}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th style={styles.th}>Campaign</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="animate-fade-in"
                    style={{
                      borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={styles.td}>
                      <div>
                        <p style={{ fontWeight: 500, marginBottom: '2px' }}>{c.brandName} - {c.campaignName}</p>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span className={STATUS_CONFIG[c.campaignStatus].className}>
                        {STATUS_CONFIG[c.campaignStatus].label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>
                      ${Number(c.amount).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(c.id);
                          }}
                          className="cn-btn-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              className="cn-btn-ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              ← Prev
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="cn-btn-ghost"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Delete modal */}
      {deleteId !== null && (
        <div style={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div
            className="cn-card-elevated"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Delete Campaign?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              This action cannot be undone. The campaign and all its data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cn-btn-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
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

const DashIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>;
const CampaignIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },
  sidebar: {
    width: '220px', flexShrink: 0,
    background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '20px 12px', position: 'sticky', top: 0, height: '100vh',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' },
  logoMark: { width: '30px', height: '30px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '4px' },
  avatar: { width: '28px', height: '28px', background: 'var(--accent-glow)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', flexShrink: 0 },
  logoutBtn: { width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  filters: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' },
  td: { padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' },
  modal: { width: '100%', maxWidth: '400px', padding: '28px' },
};