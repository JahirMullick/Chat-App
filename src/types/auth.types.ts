// types/auth.types.ts

export interface LockScreenProps {
  onUnlock: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export type BiometricType = 'fingerprint' | 'face' | null;

export type PinPadButton = number | 'bio' | 'del';

export type PinPadRow = PinPadButton[];

export interface AuthState {
  pin: string;
  savedPin: string | null;
  isSettingPin: boolean;
  confirmPin: string;
  isConfirming: boolean;
  biometricsAvailable: boolean;
  biometricType: BiometricType;
  attempts: number;
  isLockedOut: boolean;
  lockoutEndTime: number | null;
}

export interface SecureStoreKeys {
  APP_PIN: 'app_pin';
  LOCKOUT_TIME: 'lockout_time';
  BIOMETRIC_ENABLED: 'biometric_enabled';
}