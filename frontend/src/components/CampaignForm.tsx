import React, { useState, useEffect } from 'react';

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
  brandName: '',
  campaignName: '',
  platform: '',
  contentType: '',
  deadline: '',
  amount: '',
  priority: '',
  paymentStatus: '',
  contactName: '',
  contactEmail: '',
  notes: '',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="cn-label">
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className="cn-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{ cursor: 'pointer' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function CampaignForm({
  initialData,
  mode,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
}: CampaignFormProps) {
  const [form, setForm] = useState<CampaignFormData>({ ...EMPTY, ...initialData });

  useEffect(() => {
    if (initialData) setForm({ ...EMPTY, ...initialData });
  }, [initialData]);

  const set = <K extends keyof CampaignFormData>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Section: Campaign Info */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Campaign Info</p>
        <div style={grid2}>
          <Field label="Brand Name" required>
            <input
              className="cn-input"
              placeholder="e.g. Nike"
              value={form.brandName}
              onChange={set('brandName')}
              required
              disabled={loading}
            />
          </Field>

          <Field label="Campaign Name" required>
            <input
              className="cn-input"
              placeholder="e.g. Summer Drop 2025"
              value={form.campaignName}
              onChange={set('campaignName')}
              required
              disabled={loading}
            />
          </Field>

          <Field label="Platform" required>
            <Select
              value={form.platform}
              onChange={(v) => setForm((p) => ({ ...p, platform: v as Platform }))}
              placeholder="Select platform…"
              disabled={loading}
              options={[
                { value: 'instagram', label: 'Instagram' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'twitter', label: 'Twitter / X' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Field>

          <Field label="Content Type" required>
            <Select
              value={form.contentType}
              onChange={(v) => setForm((p) => ({ ...p, contentType: v as ContentType }))}
              placeholder="Select type…"
              disabled={loading}
              options={[
                { value: 'reel', label: 'Reel' },
                { value: 'post', label: 'Post' },
                { value: 'story', label: 'Story' },
                { value: 'video', label: 'Video' },
                { value: 'article', label: 'Article' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Field>

          <Field label="Deadline">
            <input
              className="cn-input"
              type="date"
              value={form.deadline}
              onChange={set('deadline')}
              disabled={loading}
            />
          </Field>

          <Field label="Amount (₹ / $)" required>
            <div style={{ position: 'relative' }}>
              <span style={currencyPrefix}>$</span>
              <input
                className="cn-input"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={set('amount')}
                required
                disabled={loading}
                style={{ paddingLeft: '24px' }}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Section: Status */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Status & Priority</p>
        <div style={grid2}>
          <Field label="Priority" required>
            <Select
              value={form.priority}
              onChange={(v) => setForm((p) => ({ ...p, priority: v as Priority }))}
              placeholder="Select priority…"
              disabled={loading}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </Field>

          <Field label="Payment Status" required>
            <Select
              value={form.paymentStatus}
              onChange={(v) => setForm((p) => ({ ...p, paymentStatus: v as PaymentStatus }))}
              placeholder="Select status…"
              disabled={loading}
              options={[
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Section: Contact */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Contact</p>
        <div style={grid2}>
          <Field label="Contact Name">
            <input
              className="cn-input"
              placeholder="e.g. Sarah Johnson"
              value={form.contactName}
              onChange={set('contactName')}
              disabled={loading}
            />
          </Field>

          <Field label="Contact Email">
            <input
              className="cn-input"
              type="email"
              placeholder="sarah@brand.com"
              value={form.contactEmail}
              onChange={set('contactEmail')}
              disabled={loading}
            />
          </Field>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="cn-card" style={{ padding: '24px' }}>
        <p style={sectionLabel}>Notes</p>
        <textarea
          className="cn-input"
          placeholder="Any additional details, deliverables, or reminders…"
          value={form.notes}
          onChange={set('notes')}
          disabled={loading}
          rows={4}
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
      </div>

      {/* Error */}
      {error && (
        <p
          className="cn-error-msg"
          style={{
            padding: '12px 16px',
            background: 'rgba(248,113,113,0.06)',
            borderRadius: '8px',
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
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
        <button
          type="submit"
          className="cn-btn-primary"
          disabled={loading}
          style={{ minWidth: '160px' }}
        >
          {loading ? (
            <>
              <span style={spinner} />
              {mode === 'create' ? 'Creating…' : 'Saving…'}
            </>
          ) : mode === 'create' ? (
            'Create Campaign'
          ) : (
            'Save Changes'
          )}
        </button>
        {onCancel && (
          <button type="button" className="cn-btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '16px',
};

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
};

const currencyPrefix: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
  fontSize: '14px',
  pointerEvents: 'none',
};

const spinner: React.CSSProperties = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(13,15,20,0.3)',
  borderTopColor: '#0d0f14',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};