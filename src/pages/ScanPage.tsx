import { useState, useEffect, useRef } from 'react';
import { FolderPicker } from '../components/FolderPicker';
import { ScanProgress } from '../components/ScanProgress';
import type { ScanProgress as ScanProgressType } from '../types';

interface ScanPageProps {
  scanning: boolean;
  progress: ScanProgressType | null;
  error: string | null;
  recentScans: string[];
  onStartScan: (path: string) => void;
}

export function ScanPage({ scanning, progress, error, recentScans, onStartScan }: ScanPageProps) {
  const [path, setPath] = useState('');
  const [started, setStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    if (!path.trim()) return;
    setStarted(true);
    onStartScan(path.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan();
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
        animation: 'fadeIn 0.3s ease forwards',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
          Scan a Folder
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Choose a folder to analyze its disk usage
        </p>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: `1px solid var(--color-border)`,
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FolderPicker
            value={path}
            onChange={setPath}
            onBrowse={undefined}
          />
          <button
            onClick={handleScan}
            onKeyDown={handleKeyDown}
            disabled={scanning || !path.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: scanning || !path.trim()
                ? 'var(--color-border)'
                : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              color: scanning || !path.trim() ? 'var(--color-text-tertiary)' : 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: scanning || !path.trim() ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!scanning && path.trim()) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {scanning ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid var(--color-text-tertiary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                Scanning...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Scan Now
              </>
            )}
          </button>
        </div>
      </div>

      {progress && (
        <div style={{ marginBottom: '24px', animation: 'slideUp 0.3s ease forwards' }}>
          <ScanProgress progress={progress} />
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--color-error-light)',
            border: `1px solid var(--color-error)`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '0.9rem',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease forwards',
          }}
        >
          {error}
        </div>
      )}

      {recentScans.length > 0 && !scanning && !started && (
        <div style={{ animation: 'slideUp 0.3s ease forwards' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
            Recent Scans
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentScans.map((scan) => (
              <button
                key={scan}
                onClick={() => { setPath(scan); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: `1px solid var(--color-border)`,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-surface)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                  {scan}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
