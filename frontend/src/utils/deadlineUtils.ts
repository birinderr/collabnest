/**
 * Returns style + a human-readable label for a deadline string.
 * Used by CampaignsPage table and CampaignDetailsPage header.
 */
export interface DeadlineStatus {
  color: string;
  background: string;
  border: string;
  label: string;        // e.g. "3 days left", "Overdue", "Apr 17"
  urgency: 'overdue' | 'critical' | 'warning' | 'ok' | 'none';
}

export function getDeadlineInfo(deadline?: string | null): DeadlineStatus {
  if (!deadline) {
    return {
      color: 'var(--text-muted)',
      background: 'transparent',
      border: 'transparent',
      label: '—',
      urgency: 'none',
    };
  }

  const now  = new Date();
  const due  = new Date(deadline);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (diff < 0) {
    return {
      color: '#f87171',
      background: 'rgba(248,113,113,0.10)',
      border: '1px solid rgba(248,113,113,0.25)',
      label: `${Math.abs(diff)}d overdue`,
      urgency: 'overdue',
    };
  }
  if (diff === 0) {
    return {
      color: '#f87171',
      background: 'rgba(248,113,113,0.10)',
      border: '1px solid rgba(248,113,113,0.25)',
      label: 'Due today',
      urgency: 'critical',
    };
  }
  if (diff <= 3) {
    return {
      color: '#f87171',
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.2)',
      label: `${diff}d left`,
      urgency: 'critical',
    };
  }
  if (diff <= 7) {
    return {
      color: '#f0a500',
      background: 'rgba(240,165,0,0.08)',
      border: '1px solid rgba(240,165,0,0.22)',
      label: `${diff}d left`,
      urgency: 'warning',
    };
  }
  return {
    color: 'var(--text-secondary)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    label: formatted,
    urgency: 'ok',
  };
}

/** Legacy shim — kept so existing imports don't break */
export function getDeadlineStatus(deadline?: string | null) {
  const { color, background, border } = getDeadlineInfo(deadline);
  return { color, background, border };
}