import { useState } from 'react';

interface FolderPickerProps {
  value: string;
  onChange: (path: string) => void;
  onBrowse?: () => void;
}

export function FolderPicker({ value, onChange, onBrowse }: FolderPickerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (v && !v.startsWith('/') && !v.match(/^[A-Za-z]:\\/)) {
      setError('Please enter a valid absolute path');
    } else {
      setError(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor="folder-input"
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
        }}
      >
        Folder Path
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          id="folder-input"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="/home/user/Documents"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)';
          }}
        />
        {onBrowse && (
          <button
            onClick={onBrowse}
            aria-label="Browse for folder"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-hover)';
              e.currentTarget.style.background = 'var(--color-surface-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-surface)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            Browse
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  );
}
