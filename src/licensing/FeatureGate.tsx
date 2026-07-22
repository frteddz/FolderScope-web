import { type ReactNode } from 'react';
import { useLicense } from './LicenseProvider';

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
}

export function FeatureGate({ children, feature }: FeatureGateProps) {
  const { isPro, loading, setShowProModal } = useLicense();

  if (loading) return <>{children}</>;

  if (isPro) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        {children}
      </div>
      <div
        onClick={() => setShowProModal(true)}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            transition: 'all var(--transition-normal)',
          }}
        >
          <span>🔒</span>
          <span>{feature} &mdash; Pro Feature</span>
        </div>
      </div>
    </div>
  );
}
