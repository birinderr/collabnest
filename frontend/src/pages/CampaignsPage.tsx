import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import campaignService, { type Campaign } from '../services/campaignService';
import { getDeadlineInfo } from '../utils/deadlineUtils';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; color: string }> = {
  DRAFT:       { label: 'Draft',       className: 'cn-badge cn-badge-draft',      color: '#858ca6' },
  IN_PROGRESS: { label: 'In Progress', className: 'cn-badge cn-badge-active',     color: '#f0a500' },
  SUBMITTED:   { label: 'Submitted',   className: 'cn-badge cn-badge-paused',     color: '#c084fc' },
  APPROVED:    { label: 'Approved',    className: 'cn-badge cn-badge-completed',  color: '#34d399' },
  COMPLETED:   { label: 'Completed',   className: 'cn-badge cn-badge-completed',  color: '#34d399' },
  CANCELLED:   { label: 'Cancelled',   className: 'cn-badge cn-badge-paused',     color: '#f87171' },
};

const STATUSES = [
  { value: '',            label: 'All'         },
  { value: 'DRAFT',       label: 'Draft'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED',   label: 'Submitted'   },
  { value: 'APPROVED',    label: 'Approved'    },
  { value: 'COMPLETED',   label: 'Completed'   },
  { value: 'CANCELLED',   label: 'Cancelled'   },
];

const KANBAN_COLS = [
  { key: 'DRAFT',       label: 'Draft',       accent: '#858ca6' },
  { key: 'IN_PROGRESS', label: 'In Progress', accent: '#f0a500' },
  { key: 'SUBMITTED',   label: 'Submitted',   accent: '#c084fc' },
  { key: 'APPROVED',    label: 'Approved',    accent: '#34d399' },
  { key: 'COMPLETED',   label: 'Completed',   accent: '#34d399' },
  { key: 'CANCELLED',   label: 'Cancelled',   accent: '#f87171' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SideLink({ href, label, icon, active, badge }: {
  href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: number;
}) {
  return (
    <Link to={href} className={`cn-nav-link${active ? ' active' : ''}`} style={{ justifyContent: 'space-between' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>{icon}{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          fontSize: '10px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
          background: active ? 'rgba(240,165,0,0.2)' : 'var(--bg-elevated)',
          color: active ? 'var(--accent)' : 'var(--text-muted)',
          border: `1px solid ${active ? 'rgba(240,165,0,0.25)' : 'var(--border)'}`,
          borderRadius: '10px', padding: '1px 7px', minWidth: '20px', textAlign: 'center',
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

/** Shape-accurate skeleton that mirrors the table row layout */
function TableSkeleton() {
  return (
    <div style={{ padding: '0' }}>
      {/* Fake header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
        gap: '16px', padding: '10px 18px', background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
      }}>
        {['60%','40%','50%','35%','45%','30%'].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: '10px', width: w, borderRadius: '4px' }} />
        ))}
      </div>
      {[1,2,3,4].map((i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
          gap: '16px', padding: '14px 18px', borderBottom: '1px solid var(--border)',
          opacity: 1 - i * 0.15,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="skeleton" style={{ height: '13px', width: '70%', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '10px', width: '40%', borderRadius: '4px' }} />
          </div>
          <div className="skeleton" style={{ height: '22px', width: '72px', borderRadius: '5px' }} />
          <div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '5px' }} />
          <div className="skeleton" style={{ height: '13px', width: '55%', borderRadius: '4px', alignSelf: 'center' }} />
          <div className="skeleton" style={{ height: '13px', width: '60%', borderRadius: '4px', alignSelf: 'center' }} />
          <div className="skeleton" style={{ height: '28px', width: '60px', borderRadius: '7px' }} />
        </div>
      ))}
    </div>
  );
}

/** Shape-accurate Kanban skeleton */
function KanbanSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
      {[1,2,3].map((col) => (
        <div key={col} className="cn-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div className="skeleton" style={{ height: '11px', width: '60px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '18px', width: '24px', borderRadius: '10px' }} />
          </div>
          {[1,2].map((card) => (
            <div key={card} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px',
              opacity: 1 - card * 0.2,
            }}>
              <div className="skeleton" style={{ height: '12px', width: '80%', borderRadius: '4px' }} />
              <div className="skeleton" style={{ height: '10px', width: '50%', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <div className="skeleton" style={{ height: '20px', width: '55px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ height: '20px', width: '65px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Kanban card */
function KanbanCard({ campaign, onDelete, onClick }: {
  campaign: Campaign;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const dl = getDeadlineInfo(campaign.deadline as string);
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '14px', cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.3 }}>
          {campaign.campaignName}
        </p>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{campaign.brandName}</p>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
          padding: '2px 8px', borderRadius: '4px',
          color: dl.color, background: dl.background, border: dl.border,
        }}>
          {dl.urgency === 'none' ? 'No deadline' : dl.label}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
          padding: '2px 8px', borderRadius: '4px',
          color: 'var(--text-secondary)', background: 'var(--bg-hover)', border: '1px solid var(--border)',
        }}>
          ${Number(campaign.amount).toLocaleString()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {campaign.platform}
        </span>
        <button
          onClick={onDelete}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '3px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/** Rich empty state */
function EmptyState({ search, statusFilter }: { search: string; statusFilter: string }) {
  if (search || statusFilter) {
    return (
      <div style={{ padding: '72px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '4px',
        }}>🔍</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          No results found
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '280px', lineHeight: 1.6 }}>
          {search ? `No campaigns match "${search}"` : `No campaigns with status "${statusFilter}"`}
          {'. Try adjusting your filters.'}
        </p>
      </div>
    );
  }
  return (
    <div style={{ padding: '72px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '60px', height: '60px', borderRadius: '16px',
        background: 'var(--accent-subtle)', border: '1px solid rgba(240,165,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '4px',
      }}>📋</div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
        No campaigns yet
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '300px', lineHeight: 1.65 }}>
        Start by creating your first campaign. Track brands, deadlines, payments and deliverables — all in one place.
      </p>
      <div style={{ marginTop: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none' }}>
          <PlusIcon /> Create Campaign
        </Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          or press <kbd style={{
            fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 700,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '2px 6px', color: 'var(--text-secondary)',
          }}>N</kbd>
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [campaigns, setCampaigns]       = useState<Campaign[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [error, setError]               = useState('');
  const [view, setView]                 = useState<'table' | 'kanban'>('table');
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

  // ── Keyboard shortcut: N → new campaign ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') navigate('/campaigns/new');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await campaignService.delete(deleteId);
      setDeleteId(null);
      fetchCampaigns();
      showToast('Campaign deleted', 'success');
    } catch {
      setError('Delete failed');
      showToast('Failed to delete campaign', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const filtered = campaigns.filter((c) => {
    const matchSearch = !search
      || c.campaignName?.toLowerCase().includes(search.toLowerCase())
      || c.brandName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.campaignStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="cn-page">
      {/* ── Sidebar ── */}
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
            <SideLink href="/campaigns"     label="Campaigns"    icon={<CampaignIcon />} active badge={totalCount} />
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

      {/* ── Main ── */}
      <main className="cn-main">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', marginBottom: '3px' }}>Campaigns</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {loading ? 'Loading…' : `${filtered.length} campaign${filtered.length !== 1 ? 's' : ''}${totalCount !== filtered.length ? ` of ${totalCount}` : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{
              display: 'flex', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: '9px', padding: '3px', gap: '2px',
            }}>
              <button
                onClick={() => setView('table')}
                title="Table view"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  background: view === 'table' ? 'var(--bg-hover)' : 'transparent',
                  color: view === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                <TableIcon /> List
              </button>
              <button
                onClick={() => setView('kanban')}
                title="Kanban view"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  background: view === 'kanban' ? 'var(--bg-hover)' : 'transparent',
                  color: view === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                <KanbanIcon /> Board
              </button>
            </div>

            <Link to="/campaigns/new" className="cn-btn-primary" style={{ textDecoration: 'none' }}>
              <PlusIcon /> New
              <kbd style={{
                fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                background: 'rgba(0,0,0,0.2)', borderRadius: '3px',
                padding: '1px 5px', marginLeft: '2px', letterSpacing: 0,
              }}>N</kbd>
            </Link>
          </div>
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
                  padding: '8px 13px', borderRadius: '7px', border: '1px solid',
                  fontSize: '12.5px', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: statusFilter === s.value ? 600 : 400,
                  background: statusFilter === s.value ? 'var(--accent-subtle)' : 'transparent',
                  borderColor: statusFilter === s.value ? 'rgba(240,165,0,0.28)' : 'var(--border)',
                  color: statusFilter === s.value ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="cn-error-msg">{error}</p>}

        {/* ── TABLE VIEW ── */}
        {view === 'table' && (
          <div className="cn-card" style={{ overflow: 'hidden', padding: 0 }}>
            {loading ? <TableSkeleton /> : filtered.length === 0 ? (
              <EmptyState search={search} statusFilter={statusFilter} />
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
                  {paginated.map((c) => {
                    const dl = getDeadlineInfo(c.deadline as string);
                    return (
                      <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)}>
                        <td>
                          <p style={{ fontWeight: 500, marginBottom: '1px' }}>{c.campaignName}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.brandName}</p>
                        </td>
                        <td>
                          <span className={STATUS_CONFIG[c.campaignStatus]?.className || 'cn-badge cn-badge-draft'}>
                            {STATUS_CONFIG[c.campaignStatus]?.label || c.campaignStatus}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 9px', borderRadius: '5px',
                            fontSize: '12px', fontWeight: 600, fontFamily: 'Syne, sans-serif',
                            color: dl.color, background: dl.background, border: dl.border,
                          }}>
                            {(dl.urgency === 'overdue' || dl.urgency === 'critical') && (
                              <span style={{ fontSize: '10px' }}>⚠</span>
                            )}
                            {dl.label}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>${Number(c.amount).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
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
        )}

        {/* ── KANBAN VIEW ── */}
        {view === 'kanban' && (
          loading ? <KanbanSkeleton /> : filtered.length === 0 ? (
            <div className="cn-card" style={{ padding: 0, overflow: 'hidden' }}>
              <EmptyState search={search} statusFilter={statusFilter} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', alignItems: 'start' }}>
              {KANBAN_COLS.map((col) => {
                const cards = filtered.filter((c) => c.campaignStatus === col.key);
                return (
                  <div key={col.key} className="cn-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.accent, flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {col.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
                        background: cards.length > 0 ? `${col.accent}18` : 'var(--bg-elevated)',
                        color: cards.length > 0 ? col.accent : 'var(--text-muted)',
                        border: `1px solid ${cards.length > 0 ? `${col.accent}30` : 'var(--border)'}`,
                        borderRadius: '10px', padding: '1px 7px',
                      }}>
                        {cards.length}
                      </span>
                    </div>

                    {cards.length === 0 ? (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No campaigns
                      </div>
                    ) : (
                      cards.map((c) => (
                        <KanbanCard
                          key={c.id}
                          campaign={c}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          onDelete={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Pagination (table view only) */}
        {view === 'table' && totalPages > 1 && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', flexShrink: 0 }}>
                <TrashIcon />
              </div>
              <h3 style={{ fontSize: '16px' }}>Delete Campaign?</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.65', marginBottom: '24px' }}>
              This action cannot be undone. The campaign and all its data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="cn-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
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

// ─── Icons ────────────────────────────────────────────────────────────────────
const DashIcon     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const CampaignIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon     = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SearchIcon   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const TrashIcon    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M3.5 3.5l.75 8h5.5l.75-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TableIcon    = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="6" width="12" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="10.5" width="12" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>;
const KanbanIcon   = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="5.25" y="1" width="3.5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9.5" y="1" width="3.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>;