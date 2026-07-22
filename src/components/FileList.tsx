import type { FileEntry } from '../types';
import { formatBytes, formatDate } from '../utils/formatUtils';

interface FileListProps {
  files: FileEntry[];
}

export function FileList({ files }: FileListProps) {
  const sorted = [...files].sort((a, b) => b.size - a.size);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
        No files found
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ borderBottom: `1px solid var(--color-border)` }}>
            <Th>Name</Th>
            <Th style={{ width: '180px' }}>Path</Th>
            <Th style={{ width: '100px', textAlign: 'right' }}>Size</Th>
            <Th style={{ width: '80px' }}>Type</Th>
            <Th style={{ width: '120px' }}>Modified</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 100).map((file, i) => (
            <tr
              key={file.path}
              style={{
                borderBottom: `1px solid var(--color-border)`,
                animation: `fadeIn 0.2s ease ${i * 10}ms forwards`,
                opacity: 0,
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileIcon type={file.type} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={file.name}>
                    {file.name}
                  </span>
                </div>
              </Td>
              <Td>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px', display: 'block' }} title={file.path}>
                  {file.path}
                </span>
              </Td>
              <Td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {formatBytes(file.size)}
              </Td>
              <Td>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  {file.type}
                </span>
              </Td>
              <Td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {formatDate(file.modified)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        padding: '10px 12px',
        textAlign: 'left',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '10px 12px', ...style }}>
      {children}
    </td>
  );
}

function FileIcon({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    pdf: 'var(--color-error)',
    docx: 'var(--color-info)',
    xlsx: 'var(--color-success)',
    txt: 'var(--color-text-secondary)',
    md: 'var(--color-text-secondary)',
    zip: 'var(--color-warning)',
    exe: 'var(--color-text)',
    jpg: 'var(--color-primary)',
    jpeg: 'var(--color-primary)',
    png: 'var(--color-primary)',
    gif: 'var(--color-primary)',
    mp4: 'var(--color-error)',
    mkv: 'var(--color-error)',
    mov: 'var(--color-error)',
    mp3: 'var(--color-primary)',
    flac: 'var(--color-primary)',
    ts: 'var(--color-info)',
    tsx: 'var(--color-info)',
    js: 'var(--color-warning)',
    json: 'var(--color-text-secondary)',
    css: 'var(--color-primary)',
    html: 'var(--color-warning)',
  };

  const color = colorMap[type] || 'var(--color-text-tertiary)';

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
