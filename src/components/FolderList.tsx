import type { FolderEntry } from '../types';
import { formatBytes } from '../utils/formatUtils';

interface FolderListProps {
  folders: FolderEntry[];
  onSelect: (folder: FolderEntry) => void;
}

export function FolderList({ folders, onSelect }: FolderListProps) {
  const sorted = [...folders].sort((a, b) => b.size - a.size);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
        No subfolders
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {sorted.slice(0, 50).map((folder, i) => {
        const barWidth = (folder.size / sorted[0].size) * 100;
        return (
          <button
            key={folder.path}
            onClick={() => onSelect(folder)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
 textAlign: 'left',
              animation: `fadeIn 0.2s ease ${i * 20}ms forwards`,
              opacity: 0,
              transition: 'all var(--transition-fast)',
              position: 'relative',
              overflow: 'hidden',
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
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${barWidth}%`,
                background: 'var(--color-primary-light)',
                opacity: 0.3,
                transition: 'width 0.3s ease',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <FolderIcon />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {folder.name}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                  {folder.fileCount} files
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {formatBytes(folder.size)}
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}
