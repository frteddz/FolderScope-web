import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { LicenseManager } from './licenseManager';
import { LICENSING_CONFIG } from './config';

interface LicenseContextValue {
  isPro: boolean;
  loading: boolean;
  showProModal: boolean;
  setShowProModal: (show: boolean) => void;
  licenseKey: string;
  setLicenseKey: (key: string) => void;
  activateLicense: () => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => void;
  checkoutUrl: string;
  activating: boolean;
}

const LicenseContext = createContext<LicenseContextValue | null>(null);

export function useLicense(): LicenseContextValue {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used within LicenseProvider');
  return ctx;
}

export function LicenseProvider({ children, productKey = 'PngForge' }: { children: ReactNode; productKey?: string }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    LicenseManager.isPro().then(setIsPro).finally(() => setLoading(false));
  }, []);

  const activateLicense = useCallback(async () => {
    if (!licenseKey.trim()) return { success: false, error: 'Enter a license key' };
    setActivating(true);
    const result = await LicenseManager.activate(licenseKey.trim());
    if (result.success) {
      setIsPro(true);
      setShowProModal(false);
      setLicenseKey('');
    }
    setActivating(false);
    return result;
  }, [licenseKey]);

  const deactivateLicense = useCallback(() => {
    LicenseManager.deactivate();
    setIsPro(false);
  }, []);

  return (
    <LicenseContext.Provider
      value={{
        isPro,
        loading,
        showProModal,
        setShowProModal,
        licenseKey,
        setLicenseKey,
        activateLicense,
        deactivateLicense,
        checkoutUrl: LicenseManager.getCheckoutUrl(productKey),
        activating,
      }}
    >
      {children}
      {showProModal && <ProModalInner />}
    </LicenseContext.Provider>
  );
}

function ProModalInner() {
  const {
    setShowProModal,
    licenseKey,
    setLicenseKey,
    activateLicense,
    checkoutUrl,
    activating,
    deactivateLicense,
    isPro,
  } = useLicense();
  const productKey = Object.keys(LICENSING_CONFIG.products)[0];
  const product = LICENSING_CONFIG.products[productKey];
  const [error, setError] = useState<string | null>(null);

  const handleActivate = useCallback(async () => {
    setError(null);
    const result = await activateLicense();
    if (!result.success) setError(result.error ?? 'Activation failed');
  }, [activateLicense]);

  return (
    <div
      onClick={() => setShowProModal(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          maxWidth: '440px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowProModal(false)}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', color: 'var(--color-text-tertiary)',
            cursor: 'pointer', padding: '0.25rem', lineHeight: 1,
            fontSize: '1.25rem',
          }}
        >
          ✕
        </button>

        {isPro ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                {product?.name ?? 'Pro'} Active
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 500 }}>
                License verified
              </p>
            </div>
            <button
              onClick={() => { deactivateLicense(); setShowProModal(false); }}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-error)', background: 'transparent',
                color: 'var(--color-error)', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Deactivate License
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                Upgrade to Pro
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Unlock all features for ${product?.price ?? 3}
              </p>
            </div>

            <a
              href={checkoutUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', width: '100%', padding: '0.75rem',
                borderRadius: 'var(--radius-md)', border: 'none',
                background: 'var(--color-primary)', color: '#fff',
                fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
                textAlign: 'center', textDecoration: 'none',
                marginBottom: '1.25rem', transition: 'all var(--transition-normal)',
              }}
            >
              Purchase License
            </a>

            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.75rem',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                  Already have a license?
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>

              <input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your license key"
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)',
                  color: 'var(--color-text)', fontSize: '0.875rem',
                  outline: 'none', fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-error)', marginBottom: '0.75rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleActivate}
              disabled={activating || !licenseKey.trim()}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: activating ? 'var(--color-border)' : 'var(--color-surface)',
                color: activating ? 'var(--color-text-tertiary)' : 'var(--color-text)',
                fontWeight: 600, fontSize: '0.875rem', cursor: activating ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-normal)',
              }}
            >
              {activating ? 'Verifying...' : 'Activate License'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
