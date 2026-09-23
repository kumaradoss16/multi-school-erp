import { UserAccount, LoginHistoryRecord, UserSession, SecuritySettingsConfig, LoginResult } from '../types/auth';
import { PasswordService } from './passwordService';
import { AuthIpcService, SanitizedUser } from './authIpcService';

/**
 * Enterprise Authentication Service (Main Process Secure Layer)
 * Manages login workflows, brute-force protection, lockout logic,
 * session tracking, and user status checks.
 */
export class AuthenticationService {
  /**
   * Performs end-to-end authentication workflow including status checks,
   * lockout enforcement, Argon2id verification, and session tracking.
   */
  public static async authenticate(
    username: string,
    candidatePassword: string,
    users: UserAccount[],
    securitySettings: SecuritySettingsConfig,
    deviceInfo: string = 'SchoolERP Desktop Client',
    clientIp: string = '192.168.1.50'
  ): Promise<{ result: LoginResult; updatedUsers: UserAccount[]; newSession?: UserSession; loginHistoryRecord: LoginHistoryRecord }> {
    const normalized = username.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === normalized);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // 1. Non-existent user check (constant-time timing mitigation)
    if (userIndex === -1) {
      await PasswordService.hashPassword(candidatePassword);
      const logRec: LoginHistoryRecord = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: 'unknown',
        username: normalized,
        timestamp: nowStr,
        result: 'FAILURE',
        eventType: 'LOGIN_FAILED',
        device: deviceInfo,
        ip: clientIp,
        reason: 'Invalid username or password credentials supplied'
      };
      return {
        result: {
          success: false,
          message: 'Invalid username or password.',
          errorCode: 'INVALID_CREDENTIALS'
        },
        updatedUsers: users,
        loginHistoryRecord: logRec
      };
    }

    const user = { ...users[userIndex] };
    const clonedUsers = [...users];

    // 2. User Status Checks (Active, Inactive, Suspended, Locked)
    const statusCheck = this.checkUserStatus(user, nowStr);
    if (!statusCheck.allowed) {
      const logRec: LoginHistoryRecord = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user.id,
        username: user.username,
        timestamp: nowStr,
        result: 'FAILURE',
        eventType: 'LOGIN_FAILED',
        device: deviceInfo,
        ip: clientIp,
        reason: statusCheck.reason
      };
      return {
        result: {
          success: false,
          message: statusCheck.message,
          errorCode: statusCheck.errorCode,
          isLocked: statusCheck.errorCode === 'ACCOUNT_LOCKED'
        },
        updatedUsers: clonedUsers,
        loginHistoryRecord: logRec
      };
    }

    // 3. Verify Argon2id Password Hash
    const isValidPassword = await PasswordService.verifyPassword(candidatePassword, user.passwordHash);

    if (!isValidPassword) {
      // 4. Brute-Force Protection & Lockout Logic
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      user.lastFailedLoginAt = nowStr;

      const maxAttempts = securitySettings.passwordPolicy?.maxFailedAttempts || 5;
      const lockoutMins = securitySettings.passwordPolicy?.lockoutDurationMinutes || 15;

      let eventType: LoginHistoryRecord['eventType'] = 'LOGIN_FAILED';
      let failureReason = `Incorrect password entered (Attempt ${user.failedLoginCount}/${maxAttempts})`;

      if (user.failedLoginCount >= maxAttempts) {
        user.status = 'LOCKED';
        user.lockedUntil = new Date(Date.now() + lockoutMins * 60000).toISOString();
        user.lockReason = `Exceeded maximum permitted failed login attempts (${maxAttempts}/${maxAttempts})`;
        eventType = 'ACCOUNT_LOCKED';
        failureReason = user.lockReason;
      }

      clonedUsers[userIndex] = user;

      const logRec: LoginHistoryRecord = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user.id,
        username: user.username,
        timestamp: nowStr,
        result: 'FAILURE',
        eventType,
        device: deviceInfo,
        ip: clientIp,
        reason: failureReason
      };

      return {
        result: {
          success: false,
          message: user.status === 'LOCKED'
            ? `Account locked due to multiple failed login attempts. Locked for ${lockoutMins} minutes.`
            : 'Invalid username or password.',
          errorCode: user.status === 'LOCKED' ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS',
          isLocked: user.status === 'LOCKED'
        },
        updatedUsers: clonedUsers,
        loginHistoryRecord: logRec
      };
    }

    // 5. Successful Authentication -> Reset Lockout Counters & Track Session
    user.failedLoginCount = 0;
    user.lastFailedLoginAt = undefined;
    user.lockedUntil = undefined;
    user.lockReason = undefined;
    user.lastLoginAt = nowStr;
    user.lastLoginIp = clientIp;

    clonedUsers[userIndex] = user;

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSession: UserSession = {
      id: sessionId,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      schoolId: user.schoolId,
      campusId: user.campusId,
      loginTime: nowStr,
      lastActivity: 'Just now',
      device: deviceInfo,
      appVersion: '3.0.0-PROD',
      ip: clientIp,
      isCurrent: true
    };

    const successLog: LoginHistoryRecord = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      username: user.username,
      timestamp: nowStr,
      result: 'SUCCESS',
      eventType: 'LOGIN_SUCCESS',
      device: deviceInfo,
      ip: clientIp,
      reason: 'Argon2id authentication verified successfully'
    };

    const sanitized: SanitizedUser = AuthIpcService.sanitizeUser(user);

    return {
      result: {
        success: true,
        user: sanitized,
        session: newSession,
        requiresPasswordChange: user.forcePasswordChange,
        message: 'Authentication successful.'
      },
      updatedUsers: clonedUsers,
      newSession,
      loginHistoryRecord: successLog
    };
  }

  /**
   * Evaluates account status and lockout expiry
   */
  public static checkUserStatus(user: UserAccount, nowStr: string): { allowed: boolean; message: string; errorCode?: string; reason: string } {
    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return {
        allowed: false,
        message: `Your account is currently ${user.status.toLowerCase()}. Please contact system administration.`,
        errorCode: 'ACCOUNT_DISABLED',
        reason: `Account is currently ${user.status}`
      };
    }

    if (user.status === 'LOCKED') {
      const isStillLocked = user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now();
      if (isStillLocked) {
        return {
          allowed: false,
          message: `Account is locked due to security policy. Lock expires at ${new Date(user.lockedUntil!).toLocaleTimeString()}.`,
          errorCode: 'ACCOUNT_LOCKED',
          reason: 'Attempted login while account is locked'
        };
      }
    }

    return { allowed: true, message: 'Account status valid', reason: 'Passed status check' };
  }

  /**
   * Terminates or revokes user session
   */
  public static terminateSession(sessions: UserSession[], sessionId: string): UserSession[] {
    return sessions.filter(s => s.id !== sessionId);
  }
}
