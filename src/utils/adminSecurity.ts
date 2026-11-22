import { User } from '../types';
import { AUTHORIZED_ADMIN_EMAIL, SECRET_ADMIN_ROUTE } from '../seedData';

/**
 * Strict Single-Admin Check:
 * Grants admin privileges ONLY when user.email === 'aingdy924@gmail.com' AND user.role === 'admin'.
 */
export function isStrictAuthorizedAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === 'admin' &&
    typeof user.email === 'string' &&
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  );
}

/**
 * Reads the 6-digit ADMIN_PIN from environment variables (or fallback '246810').
 */
export function getExpectedAdminPin(): string {
  const envPin =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ADMIN_PIN) ||
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.ADMIN_PIN) ||
    localStorage.getItem('em_env_admin_pin') ||
    '246810';
  return String(envPin).trim();
}

export function isAdminPinUnlockedForSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('em_admin_pin_unlocked') === 'true';
}

export function verifyAndUnlockAdminPin(enteredPin: string, user: User | null): boolean {
  if (!isStrictAuthorizedAdmin(user)) return false;
  const clean = enteredPin.trim();
  const expected = getExpectedAdminPin();
  if (/^\d{6}$/.test(clean) && clean === expected) {
    sessionStorage.setItem('em_admin_pin_unlocked', 'true');
    return true;
  }
  return false;
}

export function lockAdminPinSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('em_admin_pin_unlocked');
  }
}

/**
 * Backend / Database Mutation Guard:
 * Enforces strict single-admin email + role + 6-digit PIN session check before any
 * create, edit, reorder, or delete operation on lessons, videos, subtitles, vocabulary, or quizzes.
 */
export function assertStrictAdminMutationAuth(user: User | null | undefined): void {
  if (!isStrictAuthorizedAdmin(user)) {
    throw new Error('403 Forbidden: Strict single-admin email & role verification failed.');
  }
  if (!isAdminPinUnlockedForSession()) {
    throw new Error('403 Forbidden: 6-digit ADMIN_PIN session gate is locked.');
  }
}

export { SECRET_ADMIN_ROUTE, AUTHORIZED_ADMIN_EMAIL };
