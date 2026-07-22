import { useState, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { LicenseProvider, useLicense } from './licensing/LicenseProvider';
import { useScan } from './hooks/useScan';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { ResultsPage } from './pages/ResultsPage';

type Page = 'home' | 'scan' | 'results';

interface NavItem {
  key: Page;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'scan',
    label: 'Scan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'results',
    label: 'Results',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
];

export default function App() {
  return <LicenseProvider productKey="FolderScope"><AppInner /></LicenseProvider>;
}

function AppInner() {
  const [page, setPage] = useState<Page>('home');
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isPro, loading: proLoading, setShowProModal } = useLicense();
  const { scanning, progress, results, error, recentScans, startScan, reset } = useScan();

  const handleStartScan = useCallback((path: string) => {
    startScan(path);
  }, [startScan]);

  const handleShowResults = useCallback(() => {
    setPage('results');
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <aside
        style={{
          width: '220px',
          background: 'var(--color-surface)',
          borderRight: `1px solid var(--color-border)`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '20px 16px',
            borderBottom: `1px solid var(--color-border)`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>
            FolderScope
          </span>
          {!proLoading && (
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--radius-sm)',
              background: isPro ? 'var(--color-success-light)' : 'var(--color-warning-light)',
              color: isPro ? 'var(--color-success)' : 'var(--color-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {isPro ? 'Studio Pass' : 'Free'}
            </span>
          )}
        </div>

        <nav style={{ flex: 1, padding: '8px' }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                if (item.key === 'scan') reset();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: page === item.key ? 'var(--color-primary-light)' : 'transparent',
                color: page === item.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: page === item.key ? 600 : 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '2px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (page !== item.key) {
                  e.currentTarget.style.background = 'var(--color-surface-secondary)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== item.key) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '8px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {!isPro && (
            <button
              onClick={() => setShowProModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Unlock Studio Pass
            </button>
          )}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 14px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-secondary)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a
            href="https://frteddz.github.io/Euthenia-Studio-Website/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '4px 0', fontSize: '0.65rem', color: 'var(--color-text-tertiary)',
              textDecoration: 'none', borderTop: '1px solid var(--color-border)', marginTop: '2px',
            }}
          >
            Made by <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Euthenia Studio</span>
          </a>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-background)',
        }}
      >
        <div
          style={{
            display: results ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px',
            borderBottom: `1px solid var(--color-border)`,
            background: 'var(--color-surface)',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {results ? `Last scan: ${results.rootPath}` : ''}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleShowResults}
              style={{
                padding: '4px 12px',
                border: `1px solid var(--color-border)`,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              View Results
            </button>
            <button
              onClick={() => { setPage('scan'); reset(); }}
              style={{
                padding: '4px 12px',
                border: `1px solid var(--color-primary)`,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              New Scan
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {page === 'home' && <HomePage />}
          {page === 'scan' && (
            <ScanPage
              scanning={scanning}
              progress={progress}
              error={error}
              recentScans={recentScans}
              onStartScan={handleStartScan}
            />
          )}
          {page === 'results' && results && <ResultsPage results={results} />}
          {page === 'results' && !results && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--color-text-tertiary)',
                gap: '12px',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
              <p style={{ fontSize: '1rem' }}>No scan results yet</p>
              <button
                onClick={() => setPage('scan')}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Scan a Folder
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
