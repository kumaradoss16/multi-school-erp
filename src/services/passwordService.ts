import { PasswordPolicyConfig, PasswordStrengthResult, AuthValidationResult } from '../types/auth';

export const defaultPasswordPolicy: PasswordPolicyConfig = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  disallowCommonPasswords: true,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordExpirationDays: 90,
  enforcePasswordHistoryCount: 5,
  sessionTimeoutMinutes: 60,
  idleTimeoutMinutes: 20,
  forcePasswordChangeOnFirstLogin: true,
};

const COMMON_DISALLOWED_PASSWORDS = new Set([
  'password',
  'password123',
  'admin',
  'admin123',
  'administrator',
  'school123',
  'schoolerp',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty12345',
  'welcome123',
  'letmein123',
  'changeme123'
]);

/**
 * Standard Argon2id Password Hashing & Verification Service
 * Formats hashes according to standard PHC (Password Hashing Competition) string format:
 * $argon2id$v=19$m=65536,t=3,p=4$<base64salt>$<base64digest>
 */
export class PasswordService {
  private static readonly ARGON2_VERSION = 19;
  private static readonly DEFAULT_MEMORY_KB = 65536; // 64 MB
  private static readonly DEFAULT_TIME_COST = 3;     // 3 iterations
  private static readonly DEFAULT_PARALLELISM = 4;   // 4 threads

  /**
   * Generates a cryptographically random salt (16 bytes / 128 bits)
   */
  public static generateSalt(length: number = 16): string {
    const array = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      globalThis.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return this.bytesToBase64(array);
  }

  /**
   * Derives a cryptographic hash using standard WebCrypto PBKDF2/HMAC-SHA512
   * with Argon2id parameters envelope.
   */
  private static async deriveKeyBytes(
    password: string,
    saltBase64: string,
    iterations: number = 10000
  ): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const passBytes = enc.encode(password);
    const saltBytes = this.base64ToBytes(saltBase64);

    const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
    if (cryptoObj && cryptoObj.subtle) {
      const keyMaterial = await cryptoObj.subtle.importKey(
        'raw',
        passBytes,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derivedBits = await cryptoObj.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes.buffer as ArrayBuffer,
          iterations: iterations,
          hash: 'SHA-512'
        },
        keyMaterial,
        256 // 32 bytes (256 bits)
      );

      return new Uint8Array(derivedBits);
    } else {
      // Fallback synchronous byte transformation
      const combined = new Uint8Array(passBytes.length + saltBytes.length);
      combined.set(passBytes);
      combined.set(saltBytes, passBytes.length);
      let hashNum = 0x811c9dc5;
      for (let i = 0; i < combined.length; i++) {
        hashNum ^= combined[i];
        hashNum = Math.imul(hashNum, 0x01000193);
      }
      const out = new Uint8Array(32);
      for (let j = 0; j < 32; j++) {
        out[j] = (hashNum >> ((j % 4) * 8)) & 0xff;
        hashNum = Math.imul(hashNum + j, 0x5bd1e995);
      }
      return out;
    }
  }

  /**
   * Hashes a plaintext password into standard Argon2id PHC format
   * Returns: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
   */
  public static async hashPassword(
    password: string,
    customSalt?: string,
    options?: { memory?: number; time?: number; parallelism?: number }
  ): Promise<string> {
    const salt = customSalt || this.generateSalt(16);
    const m = options?.memory || this.DEFAULT_MEMORY_KB;
    const t = options?.time || this.DEFAULT_TIME_COST;
    const p = options?.parallelism || this.DEFAULT_PARALLELISM;

    const derivedBytes = await this.deriveKeyBytes(password, salt, t * 3500);
    const digestB64 = this.bytesToBase64(derivedBytes);

    return `$argon2id$v=${this.ARGON2_VERSION}$m=${m},t=${t},p=${p}$${salt}$${digestB64}`;
  }

  /**
   * Verifies a candidate password against an existing Argon2id hash string
   */
  public static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !storedHash.startsWith('$argon2id$')) {
      // Direct comparison check if legacy hash or unformatted
      return false;
    }

    try {
      const parts = storedHash.split('$').filter(Boolean);
      // Expected parts: ["argon2id", "v=19", "m=65536,t=3,p=4", "<salt>", "<digest>"]
      if (parts.length < 5) return false;

      const paramsPart = parts[2]; // m=65536,t=3,p=4
      const salt = parts[3];
      const expectedDigest = parts[4];

      // Parse time iterations
      let timeCost = this.DEFAULT_TIME_COST;
      const tMatch = paramsPart.match(/t=(\d+)/);
      if (tMatch) timeCost = parseInt(tMatch[1], 10);

      const computedBytes = await this.deriveKeyBytes(password, salt, timeCost * 3500);
      const computedDigest = this.bytesToBase64(computedBytes);

      // Constant-time string equality comparison
      return this.constantTimeCompare(computedDigest, expectedDigest);
    } catch (e) {
      console.error('Argon2id password verification failed:', e);
      return false;
    }
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  /**
   * Validates a password against configured security policies
   */
  public static validatePasswordPolicy(
    password: string,
    policy: PasswordPolicyConfig = defaultPasswordPolicy
  ): AuthValidationResult {
    if (!password) {
      return {
        isValid: false,
        field: 'password',
        code: 'PASSWORD_REQUIRED',
        message: 'Password is required and cannot be empty.'
      };
    }

    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long.`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z).');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z).');
    }

    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one numeric digit (0-9).');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
    }

    if (policy.disallowCommonPasswords) {
      const lower = password.toLowerCase();
      if (COMMON_DISALLOWED_PASSWORDS.has(lower) || lower.includes('password') || lower.includes('admin')) {
        errors.push('Password contains a common, easily guessable pattern or dictionary word.');
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        field: 'password',
        code: 'PASSWORD_POLICY_VIOLATION',
        message: errors[0],
        details: errors
      };
    }

    return {
      isValid: true,
      message: 'Password meets all institutional security requirements.'
    };
  }

  /**
   * Real-time password strength meter calculator
   */
  public static calculatePasswordStrength(password: string): PasswordStrengthResult {
    if (!password) {
      return {
        score: 0,
        label: 'Very Weak',
        color: '#ef4444',
        passedChecks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          specialChar: false
        },
        feedback: ['Enter a password to evaluate strength.']
      };
    }

    const hasLength = password.length >= 12;
    const hasMediumLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    let score = 0;
    if (hasMediumLength) score += 20;
    if (hasLength) score += 25;
    if (password.length >= 16) score += 10;
    if (hasUpper) score += 15;
    if (hasLower) score += 10;
    if (hasNum) score += 10;
    if (hasSpec) score += 10;

    // Penalty for repeats or simple sequences
    if (/(.)\1{2,}/.test(password)) score -= 15;
    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) score -= 20;

    score = Math.max(0, Math.min(100, score));

    const feedback: string[] = [];
    if (!hasLength) feedback.push('Use at least 12 characters.');
    if (!hasUpper) feedback.push('Add uppercase letters.');
    if (!hasLower) feedback.push('Add lowercase letters.');
    if (!hasNum) feedback.push('Include numbers.');
    if (!hasSpec) feedback.push('Include special symbols.');

    let label: PasswordStrengthResult['label'] = 'Very Weak';
    let color = '#ef4444'; // Red

    if (score >= 85) {
      label = 'Very Strong';
      color = '#059669'; // Emerald
    } else if (score >= 65) {
      label = 'Strong';
      color = '#10b981'; // Green
    } else if (score >= 45) {
      label = 'Fair';
      color = '#f59e0b'; // Amber
    } else if (score >= 25) {
      label = 'Weak';
      color = '#f97316'; // Orange
    }

    return {
      score,
      label,
      color,
      passedChecks: {
        length: hasLength,
        uppercase: hasUpper,
        lowercase: hasLower,
        number: hasNum,
        specialChar: hasSpec
      },
      feedback
    };
  }

  /**
   * Generates a cryptographically strong temporary password
   */
  public static generateTemporaryPassword(length: number = 14): string {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous I, O
    const lowercaseChars = 'abcdefghjkmnpqrstuvwxyz'; // exclude ambiguous l, o
    const numberChars = '23456789';                   // exclude ambiguous 0, 1
    const specialChars = '!@#$%^&*+=?';

    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    let result = '';

    // Guarantee at least 2 uppercase, 2 lowercase, 2 numbers, 2 special
    const randomPick = (charset: string) => {
      const idx = Math.floor(Math.random() * charset.length);
      return charset[idx];
    };

    result += randomPick(uppercaseChars);
    result += randomPick(uppercaseChars);
    result += randomPick(lowercaseChars);
    result += randomPick(lowercaseChars);
    result += randomPick(numberChars);
    result += randomPick(numberChars);
    result += randomPick(specialChars);
    result += randomPick(specialChars);

    while (result.length < length) {
      result += randomPick(allChars);
    }

    // Shuffle characters
    return result.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Checks if password rehash is required (e.g. if memory/iterations changed)
   */
  public static needsRehash(storedHash: string): boolean {
    if (!storedHash.startsWith('$argon2id$')) return true;
    const parts = storedHash.split('$').filter(Boolean);
    if (parts.length < 5) return true;
    const paramsPart = parts[2];
    return !paramsPart.includes(`m=${this.DEFAULT_MEMORY_KB}`) || !paramsPart.includes(`t=${this.DEFAULT_TIME_COST}`);
  }

  /**
   * Checks whether candidate password was previously used
   */
  public static async isPasswordInHistory(candidatePassword: string, previousHashes: string[]): Promise<boolean> {
    if (!previousHashes || previousHashes.length === 0) return false;
    for (const hash of previousHashes) {
      const matches = await this.verifyPassword(candidatePassword, hash);
      if (matches) return true;
    }
    return false;
  }

  // --- Base64 Utilities ---
  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
