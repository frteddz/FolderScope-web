import { LICENSING_CONFIG } from './config';
import type { LicenseData, LSValidationResult, LSActivationResult } from './types';

function generateInstanceId(): string {
  const stored = localStorage.getItem('ls_instance_id');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('ls_instance_id', id);
  return id;
}

function getStorageKey(): string {
  return `lic_${LICENSING_CONFIG.storeSlug || 'dev'}`;
}

function readLicense(): LicenseData | null {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return null;
    return JSON.parse(raw) as LicenseData;
  } catch {
    return null;
  }
}

function writeLicense(data: LicenseData): void {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function clearLicense(): void {
  localStorage.removeItem(getStorageKey());
}

async function validateWithLS(key: string): Promise<LSValidationResult> {
  try {
    const res = await fetch(`${LICENSING_CONFIG.lsApiBase}/licenses/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: key,
        instance_id: generateInstanceId(),
      }),
    });
    return await res.json();
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

async function activateWithLS(key: string): Promise<LSActivationResult> {
  const instanceId = generateInstanceId();
  try {
    const res = await fetch(`${LICENSING_CONFIG.lsApiBase}/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: key,
        instance_name: instanceId,
      }),
    });
    return await res.json();
  } catch (err) {
    return { activated: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const LicenseManager = {
  getKey(): string | null {
    return readLicense()?.key ?? null;
  },

  async isPro(): Promise<boolean> {
    if (LICENSING_CONFIG.isDev) return true;

    const data = readLicense();
    if (!data) return false;

    const result = await validateWithLS(data.key);
    if (!result.valid) {
      clearLicense();
      return false;
    }

    if (result.licenseKey?.status !== 'active') {
      clearLicense();
      return false;
    }

    return true;
  },

  async activate(key: string): Promise<{ success: boolean; error?: string }> {
    const result = await activateWithLS(key);
    if (!result.activated) {
      return { success: false, error: result.error || 'Activation failed' };
    }

    writeLicense({
      key,
      activatedAt: Date.now(),
      instanceId: generateInstanceId(),
    });

    return { success: true };
  },

  deactivate(): void {
    clearLicense();
  },

  getCheckoutUrl(productKey: string): string {
    const product = LICENSING_CONFIG.products[productKey];
    if (!product || !LICENSING_CONFIG.storeSlug) return '';
    return `https://${LICENSING_CONFIG.storeSlug}.lemonsqueezy.com/checkout/buy/${product.variantId}`;
  },
};
