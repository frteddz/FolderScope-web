export interface LicenseData {
  key: string;
  activatedAt: number;
  instanceId: string;
}

export interface LSValidationResult {
  valid: boolean;
  error?: string;
  licenseKey?: {
    id: number;
    status: string;
    key: string;
    activationLimit: number;
    instancesCount: number;
    expiresAt: string | null;
  };
  instance?: {
    id: number;
    name: string;
  };
}

export interface LSActivationResult {
  activated: boolean;
  error?: string;
  licenseKey?: {
    id: number;
    status: string;
    key: string;
    activationLimit: number;
  };
  instance?: {
    id: number;
    name: string;
  };
}
