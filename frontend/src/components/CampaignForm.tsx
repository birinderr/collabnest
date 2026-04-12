import React, { useState, useEffect } from 'react';
import { getDeadlineInfo } from '../utils/deadlineUtils';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'other';
export type ContentType = 'reel' | 'post' | 'story' | 'video' | 'article' | 'other';

export interface CampaignFormData {
  brandName: string;
  campaignName: string;
  platform: Platform | '';
  contentType: ContentType | '';
  deadline: string;
  amount: number | '';
  priority: Priority | '';
  paymentStatus: PaymentStatus | '';
  contactName: string;
  contactEmail: string;
  notes: string;
}

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  mode: 'create' | 'edit';
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

const EMPTY: CampaignFormData = {
  brandName: '', campaignName: '', platform: '', contentType: '',
  deadline: '', amount: '', priority: '', paymentStatus: '',
  contactName: '', contactEmail: '', notes: '',
};

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="cn-label">
          {label}
          {required && <span style={{ color: 'var(--accent)', marginLeft: '3px' }}>*</span>}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function Select({
  value, onChange, options, placeholder, disabled,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <select className="cn-input" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} style={{ cursor: 'pointer' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** Formats a raw number string into $X,XXX display */
function formatAmount(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export default function CampaignForm({
  initialData, mode, onSubmit, onCancel, loading = false, error = '',
}: CampaignFormProps) {
  const [form, setForm] = useState<CampaignFormData>({ ...EMPTY, ...initialData });
  // Separate display value for amount (formatted) vs raw numeric
  const [amountDisplay, setAmountDisplay] = useState(
    initialData?.amount ? Number(initialData.amount).toLocaleString('en-US') : ''
  );

  useEffect(() => {
    if (initialData) {
      setForm({ ...EMPTY, ...initialData });
      setAmountDisplay(initialData.amount ? Number(initialData.amount).toLocaleString('en-US') : '');
    }
  }, [initialData]);

  const set = <K extends keyof CampaignFormData>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setAmountDisplay(formatAmount(raw));
    setForm((prev) => ({ ...prev, amount: raw === '' ? '' : Number(raw) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // Deadline urgency hint shown next to the label
  const deadlineHint = form.deadline ? (() => {
    const dl = getDeadlineInfo(form.deadline);
    if (dl.urgency === 'none' || dl.urgency === 'ok') return null;
    return (
      <span style={{
        fontSize: '11px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
        color: dl.color, background: dl.background, border: dl.border,
        padding: '2px 8px', borderRadius: '4px',
      }}>
        {dl.urgency === 'overdue' ? '⚠ ' : dl.urgency === 'critical' ? '🔴 ' : '🟡 '}
        {dl.label}
      </span>
    );
  })() : null;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Campaign Info ── */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Campaign Info</p>
        <div style={grid2}>
          <Field label="Brand Name" required>
            <input className="cn-input" placeholder="e.g. Nike" value={form.brandName} onChange={set('brandName')} required disabled={loading} />
          </Field>

          <Field label="Campaign Name" required>
            <input className="cn-input" placeholder="e.g. Summer Drop 2025" value={form.campaignName} onChange={set('campaignName')} required disabled={loading} />
          </Field>

          <Field label="Platform" required>
            <Select value={form.platform} onChange={(v) => setForm((p) => ({ ...p, platform: v as Platform }))}
              placeholder="Select platform…" disabled={loading}
              options={[
                { value: 'instagram', label: 'Instagram' }, { value: 'youtube', label: 'YouTube' },
                { value: 'tiktok', label: 'TikTok' }, { value: 'twitter', label: 'Twitter / X' },
                { value: 'linkedin', label: 'LinkedIn' }, { value: 'other', label: 'Other' },
              ]}
            />
          </Field>

          <Field label="Content Type" required>
            <Select value={form.contentType} onChange={(v) => setForm((p) => ({ ...p, contentType: v as ContentType }))}
              placeholder="Select type…" disabled={loading}
              options={[
                { value: 'reel', label: 'Reel' }, { value: 'post', label: 'Post' },
                { value: 'story', label: 'Story' }, { value: 'video', label: 'Video' },
                { value: 'article', label: 'Article' }, { value: 'other', label: 'Other' },
              ]}
            />
          </Field>

          {/* Deadline with urgency hint */}
          <Field label="Deadline" hint={deadlineHint}>
            <input className="cn-input" type="date" value={form.deadline} onChange={set('deadline')} disabled={loading}
              style={form.deadline && getDeadlineInfo(form.deadline).urgency !== 'ok' && getDeadlineInfo(form.deadline).urgency !== 'none' ? {
                borderColor: getDeadlineInfo(form.deadline).color,
                boxShadow: `0 0 0 3px ${getDeadlineInfo(form.deadline).background}`,
              } : {}}
            />
          </Field>

          {/* Amount with live formatting */}
          <Field label="Amount (₹ / $)" required>
            <div style={{ position: 'relative' }}>
              <span style={currencyPrefix}>$</span>
              <input
                className="cn-input"
                inputMode="numeric"
                placeholder="0"
                value={amountDisplay}
                onChange={handleAmountChange}
                required
                disabled={loading}
                style={{ paddingLeft: '24px', fontVariantNumeric: 'tabular-nums' }}
              />
              {amountDisplay && (
                <span style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '11px', color: 'var(--text-muted)', pointerEvents: 'none',
                  fontFamily: 'Syne, sans-serif', fontWeight: 600,
                }}>
                  ${Number(String(amountDisplay).replace(/,/g, '')).toLocaleString()}
                </span>
              )}
            </div>
          </Field>
        </div>
      </div>

      {/* ── Status & Priority ── */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Status & Priority</p>
        <div style={grid2}>
          <Field label="Priority" required>
            <Select value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v as Priority }))}
              placeholder="Select priority…" disabled={loading}
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]}
            />
          </Field>
          <Field label="Payment Status" required>
            <Select value={form.paymentStatus} onChange={(v) => setForm((p) => ({ ...p, paymentStatus: v as PaymentStatus }))}
              placeholder="Select status…" disabled={loading}
              options={[{ value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }]}
            />
          </Field>
        </div>
      </div>

      {/* ── Contact ── */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Contact</p>
        <div style={grid2}>
          <Field label="Contact Name">
            <input className="cn-input" placeholder="e.g. Sarah Johnson" value={form.contactName} onChange={set('contactName')} disabled={loading} />
          </Field>
          <Field label="Contact Email">
            <input className="cn-input" type="email" placeholder="sarah@brand.com" value={form.contactEmail} onChange={set('contactEmail')} disabled={loading} />
          </Field>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Notes</p>
        <textarea className="cn-input" placeholder="Any additional details, deliverables, or reminders…"
          value={form.notes} onChange={set('notes')} disabled={loading}
          rows={4} style={{ resize: 'vertical', minHeight: '100px' }}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="cn-error-msg" style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.06)', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.15)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="10" r="0.75" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
        <button type="submit" className="cn-btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
          {loading ? (
            <><span style={spinner} />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
          ) : mode === 'create' ? 'Create Campaign' : 'Save Changes'}
        </button>
        {onCancel && (
          <button type="button" className="cn-btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        )}
      </div>
    </form>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
  color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px',
};
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' };
const currencyPrefix: React.CSSProperties = {
  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
  color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none',
};
const spinner: React.CSSProperties = {
  display: 'inline-block', width: '14px', height: '14px',
  border: '2px solid rgba(13,15,20,0.3)', borderTopColor: '#0d0f14',
  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
};