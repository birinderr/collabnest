/**
 * Get deadline urgency status based on days until deadline
 * @param deadline - ISO date string (e.g., "2025-04-20")
 * @returns Object with color, background, border, and label
 */
export function getDeadlineStatus(deadline: string | undefined) {
  if (!deadline) {
    return {
      color: 'var(--text-secondary)',
      background: 'transparent',
      label: 'No deadline',
      urgency: 'none' as const,
    };
  }

  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Overdue or within 3 days: RED
  if (daysUntil <= 3) {
    return {
      color: '#f87171',
      background: 'rgba(248,113,113,0.09)',
      border: '1px solid rgba(248,113,113,0.2)',
      label: daysUntil < 0 ? 'Overdue' : `${daysUntil}d left`,
      urgency: 'critical' as const,
    };
  }

  // Within 7 days: AMBER
  if (daysUntil <= 7) {
    return {
      color: '#f0a500',
      background: 'rgba(240,165,0,0.09)',
      border: '1px solid rgba(240,165,0,0.2)',
      label: `${daysUntil}d left`,
      urgency: 'warning' as const,
    };
  }

  // More than 7 days: GREEN
  return {
    color: '#34d399',
    background: 'rgba(52,211,153,0.09)',
    border: '1px solid rgba(52,211,153,0.2)',
    label: `${daysUntil}d left`,
    urgency: 'ok' as const,
  };
}
