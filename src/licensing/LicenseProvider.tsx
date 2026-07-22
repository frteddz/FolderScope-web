import { createContext, useContext, type ReactNode } from 'react';
import { useLicense as useStudioPassLicense } from '@euthenia-studio/shared';

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

const STUDIO_PASS_URL = 'https://frteddz.github.io/Euthenia-Studio-Website/#studio-pass';

export function LicenseProvider({ children }: { children: ReactNode; productKey?: string }) {
  const { isPro, loading } = useStudioPassLicense();

  const value: LicenseContextValue = {
    isPro,
    loading,
    showProModal: false,
    setShowProModal: () => {
      window.open(STUDIO_PASS_URL, '_blank', 'noopener');
    },
    licenseKey: '',
    setLicenseKey: () => {},
    activateLicense: async () => ({ success: false, error: 'Visit the Studio Pass page to activate your license.' }),
    deactivateLicense: () => {},
    checkoutUrl: STUDIO_PASS_URL,
    activating: false,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}
