interface BreadcrumbProps {
  path: string[];
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.875rem',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => onNavigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-background)';
          e.currentTarget.style.color = 'var(--color-text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Root
      </button>
      {path.map((segment, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <button
            onClick={() => onNavigate(i)}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: i === path.length - 1 ? 'var(--color-primary-light)' : 'transparent',
              color: i === path.length - 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: i === path.length - 1 ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (i < path.length - 1) {
                e.currentTarget.style.background = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-text)';
              }
            }}
            onMouseLeave={(e) => {
              if (i < path.length - 1) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            {segment}
          </button>
        </div>
      ))}
    </nav>
  );
}
