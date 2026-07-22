import type { ScanProgress as ScanProgressType } from '../types';

interface ScanProgressProps {
  progress: ScanProgressType;
}

export function ScanProgress({ progress }: ScanProgressProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid var(--color-border)`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        animation: 'fadeIn 0.3s ease forwards',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>Scanning...</span>
          <span>{progress.percent}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--color-background)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress.percent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {progress.currentPath || 'Initializing...'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span style={{ color: 'var(--color-text)' }}>{progress.filesFound.toLocaleString()}</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>files</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span style={{ color: 'var(--color-text)' }}>{progress.foldersFound.toLocaleString()}</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>folders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
