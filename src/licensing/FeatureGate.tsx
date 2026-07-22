import type { ReactNode } from 'react';
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
          zIndex: 10, cursor: 'pointer',
        }}
      >
        <div style={{
          textAlign: 'center', padding: '1.5rem 2rem',
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'var(--color-surface, #2a2e34)',
          border: '1px solid var(--color-border, rgba(233,234,236,0.08))',
          boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.5))',
          maxWidth: 300,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text, #e9eaec)', marginBottom: '0.25rem' }}>
            {feature} &mdash; Pro Feature
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, rgba(233,234,236,0.7))' }}>
            Unlock with Euthenia Studio Pass
          </p>
          <div style={{
            marginTop: '0.75rem', padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'var(--color-primary, #fbe134)', color: '#fff',
            fontWeight: 600, fontSize: '0.8125rem',
            display: 'inline-block',
          }}>
            Get Studio Pass
          </div>
        </div>
      </div>
    </div>
  );
}
