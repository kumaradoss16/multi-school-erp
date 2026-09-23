import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Lock, 
  Unlock, 
  History, 
  UserPlus, 
  Settings, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Monitor, 
  RefreshCw, 
  FileText, 
  X, 
  Check, 
  Building2,
  ShieldAlert,
  Smartphone,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { UserAccount, Role, UserStatus, UserType, ModulePermissionRule } from '../../types/auth';
import { AuthIpcService } from '../../services/authIpcService';
import { PasswordService, defaultPasswordPolicy } from '../../services/passwordService';

export const UsersModule: React.FC = () => {
  const { state, store } = useERP();
  const users = state.users || [];
  const loginHistory = state.loginHistory || [];
  const userSessions = state.userSessions || [];
  const securitySettings = state.securitySettings || { passwordPolicy: defaultPasswordPolicy };
  const auditLogs = state.auditLogs || [];

  const [activeTab, setActiveTab] = useState<'directory' | 'sessions' | 'history' | 'security'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [lockingUser, setLockingUser] = useState<UserAccount | null>(null);
  const [selectedUserAudit, setSelectedUserAudit] = useState<UserAccount | null>(null);

  // Create User Form State
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    phone: '',
    displayName: '',
    employeeId: '',
    userType: 'Teacher' as UserType,
    role: 'TEACHER' as Role,
    schoolId: 'sch-main',
    schoolName: 'Green Valley International School',
    campusId: 'camp-1',
    campusName: 'Main City Campus',
    department: 'Teaching',
    designation: 'Senior Faculty',
    password: '',
    confirmPassword: '',
    forcePasswordChange: true
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);

  // Reset Password State
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forceChangeOnReset, setForceChangeOnReset] = useState(true);
  const [resetResultTempPass, setResetResultTempPass] = useState<string | null>(null);

  // Lock Reason State
  const [lockReasonInput, setLockReasonInput] = useState('');

  // Security Policy State
  const [policyForm, setPolicyForm] = useState({
    minLength: securitySettings.passwordPolicy.minLength,
    requireUppercase: securitySettings.passwordPolicy.requireUppercase,
    requireLowercase: securitySettings.passwordPolicy.requireLowercase,
    requireNumbers: securitySettings.passwordPolicy.requireNumbers,
    requireSpecialChars: securitySettings.passwordPolicy.requireSpecialChars,
    maxFailedAttempts: securitySettings.passwordPolicy.maxFailedAttempts,
    lockoutDurationMinutes: securitySettings.passwordPolicy.lockoutDurationMinutes,
    passwordExpirationDays: securitySettings.passwordPolicy.passwordExpirationDays,
    sessionTimeoutMinutes: securitySettings.passwordPolicy.sessionTimeoutMinutes,
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleGenerateRandomPass = () => {
    const temp = PasswordService.generateTemporaryPassword(14);
    setCreateForm(prev => ({ ...prev, password: temp, confirmPassword: temp }));
    setGeneratedTempPassword(temp);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const res = await store.createUserAccount(createForm);
    if (res.success) {
      setShowCreateModal(false);
      setCreateForm({
        username: '',
        email: '',
        phone: '',
        displayName: '',
        employeeId: '',
        userType: 'Teacher',
        role: 'TEACHER',
        schoolId: 'sch-main',
        schoolName: 'Green Valley International School',
        campusId: 'camp-1',
        campusName: 'Main City Campus',
        department: 'Teaching',
        designation: 'Senior Faculty',
        password: '',
        confirmPassword: '',
        forcePasswordChange: true
      });
      setGeneratedTempPassword(null);
    } else if (res.error) {
      setCreateError(res.error.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    const res = await store.resetUserPassword(resettingUser.id, newResetPassword || undefined, forceChangeOnReset);
    if (res.success && res.temporaryPassword) {
      setResetResultTempPass(res.temporaryPassword);
    }
  };

  const handleSaveSecurityPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSecuritySettings({
      passwordPolicy: {
        ...securitySettings.passwordPolicy,
        ...policyForm
      }
    });
    alert('Security policies updated successfully.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administration & Enterprise Users</h1>
            <p className="text-sm text-slate-500">Manage user accounts, Argon2id security credentials, RBAC permissions, and active sessions.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setGeneratedTempPassword(null);
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'sessions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Active Sessions ({userSessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Login Activity & Security Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Password Policy & Lockout Settings</span>
        </button>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, email, employee ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
                <option value="ADMIN">School Administrator</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="TEACHER">Faculty / Teacher</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="TRANSPORT_MANAGER">Transport Manager</option>
                <option value="HOSTEL_WARDEN">Hostel Warden</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOCKED">Locked</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="py-3.5 px-4">User & Account</th>
                    <th className="py-3.5 px-4">Role & Campus</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Failed Logins</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{user.displayName}</div>
                            <div className="text-xs text-slate-500 font-mono">@{user.username} • {user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 text-xs inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                          {user.roleLabel}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{user.campusName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          user.status === 'LOCKED' ? 'bg-amber-100 text-amber-800' :
                          user.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.status}
                        </span>
                        {user.status === 'LOCKED' && user.lockedUntil && (
                          <div className="text-[10px] text-amber-700 mt-0.5">
                            Until {new Date(user.lockedUntil).toLocaleTimeString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          (user.failedLoginCount || 0) > 0 ? 'bg-rose-50 text-rose-600' : 'text-slate-600'
                        }`}>
                          {user.failedLoginCount || 0} / {securitySettings.passwordPolicy.maxFailedAttempts || 5}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                        {user.lastLoginAt ? user.lastLoginAt : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Switch active user context */}
                          <button
                            onClick={() => {
                              store.switchActiveUser(user.id);
                            }}
                            title="Simulate Login / Switch Context"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setNewResetPassword('');
                              setResetResultTempPass(null);
                              setResettingUser(user);
                            }}
                            title="Reset Password"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {/* Lock / Unlock */}
                          {user.status === 'LOCKED' ? (
                            <button
                              onClick={() => store.unlockUserAccount(user.id)}
                              title="Unlock Account"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLockReasonInput('');
                                setLockingUser(user);
                              }}
                              title="Lock Account"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                          {/* Status toggle */}
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => store.setUserStatus(user.id, 'INACTIVE', 'Deactivated by admin')}
                              title="Deactivate Account"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => store.setUserStatus(user.id, 'ACTIVE')}
                              title="Activate Account"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {/* Audit history */}
                          <button
                            onClick={() => setSelectedUserAudit(user)}
                            title="View Audit History"
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${user.displayName}?`)) {
                                store.deleteUserAccount(user.id);
                              }
                            }}
                            title="Delete User Account"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Desktop & Client Sessions</h2>
              <p className="text-sm text-slate-500">Monitor and securely revoke active sessions across devices and IP addresses.</p>
            </div>
            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-lg">
              Total Active: {userSessions.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role & School</th>
                  <th className="py-3 px-4">Device & IP</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {userSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{session.displayName}</div>
                      <div className="text-xs text-slate-500 font-mono">@{session.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-blue-700">{session.role}</div>
                      <div className="text-xs text-slate-500">{session.schoolId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div>{session.device}</div>
                      <div className="text-slate-500">IP: {session.ip}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {session.loginTime}
                    </td>
                    <td className="py-3 px-4">
                      {session.isCurrent ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                          Current Session
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => store.terminateSession(session.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Terminate Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Login Activity & Security Logs */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Authentication & Security Audit Trail</h2>
              <p className="text-sm text-slate-500">Chronological log of login successes, failures, account lockouts, and password events.</p>
            </div>
            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-lg">
              Total Logs: {loginHistory.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Device & IP</th>
                  <th className="py-3 px-4">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-mono">
                {loginHistory.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 text-xs">
                    <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">@{log.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-sans text-xs font-semibold">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-sans font-bold ${
                        log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        log.result === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{log.device}</div>
                      <div className="text-[11px] text-slate-400">{log.ip}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Password Policy & Lockout Settings */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurityPolicy} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Password Policy & Brute-Force Lockout Configuration</h2>
            <p className="text-sm text-slate-500">Configure institutional cryptographic complexity requirements and security lockout parameters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Minimum Password Length</label>
              <input
                type="number"
                min="8"
                max="32"
                value={policyForm.minLength}
                onChange={(e) => setPolicyForm({ ...policyForm, minLength: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-500 mt-1 block">Recommended: at least 12 characters.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Max Failed Attempts Before Lockout</label>
              <input
                type="number"
                min="3"
                max="10"
                value={policyForm.maxFailedAttempts}
                onChange={(e) => setPolicyForm({ ...policyForm, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-500 mt-1 block">Triggers automatic account lock upon reaching limit.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Lockout Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={policyForm.lockoutDurationMinutes}
                onChange={(e) => setPolicyForm({ ...policyForm, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password Expiration (Days)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={policyForm.passwordExpirationDays}
                onChange={(e) => setPolicyForm({ ...policyForm, passwordExpirationDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Complexity Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.requireUppercase}
                  onChange={(e) => setPolicyForm({ ...policyForm, requireUppercase: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Require Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.requireLowercase}
                  onChange={(e) => setPolicyForm({ ...policyForm, requireLowercase: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Require Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.requireNumbers}
                  onChange={(e) => setPolicyForm({ ...policyForm, requireNumbers: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Require Numeric Digits (0-9)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.requireSpecialChars}
                  onChange={(e) => setPolicyForm({ ...policyForm, requireSpecialChars: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Require Special Characters (!@#$%^&*)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Save Security Policies
            </button>
          </div>
        </form>
      )}

      {/* --- Modal: Create User Account --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Create New User Account</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
                  {createError}
                </div>
              )}

              {generatedTempPassword && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-bold text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Temporary Password Generated Securely:</span>
                  </div>
                  <div className="font-mono text-base font-bold bg-white px-3 py-1.5 rounded border border-emerald-300 text-emerald-800 select-all">
                    {generatedTempPassword}
                  </div>
                  <p className="text-xs text-emerald-700">Provide this temporary password to the user. They will be forced to change it upon first login.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name / Display Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="e.g. rajesh.kumar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g. rajesh@school.edu.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => {
                      const role = e.target.value as Role;
                      setCreateForm({ ...createForm, role, userType: role === 'TEACHER' ? 'Teacher' : role === 'ADMIN' ? 'Administrator' : 'Staff' });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="SUPER_ADMIN">Super Administrator</option>
                    <option value="ADMIN">School Administrator</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="VICE_PRINCIPAL">Vice Principal</option>
                    <option value="TEACHER">Faculty / Teacher</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="TRANSPORT_MANAGER">Transport Manager</option>
                    <option value="HOSTEL_WARDEN">Hostel Warden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campus / School Scope</label>
                  <select
                    value={createForm.campusId}
                    onChange={(e) => setCreateForm({ ...createForm, campusId: e.target.value, campusName: e.target.value === 'camp-1' ? 'Main City Campus' : 'North Suburban Campus' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="camp-1">Main City Campus (Green Valley)</option>
                    <option value="camp-2">North Suburban Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={createForm.employeeId}
                    onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                    placeholder="e.g. EMP-1049"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Password Authentication (Argon2id)</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPass}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Generate Strong Temp Password
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="Password (min 12 chars)"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <label className="flex items-center space-x-3 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.forcePasswordChange}
                    onChange={(e) => setCreateForm({ ...createForm, forcePasswordChange: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Require user to change password on first login</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Reset Password --- */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Reset Password: {resettingUser.displayName}</h3>
              </div>
              <button onClick={() => setResettingUser(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetResultTempPass ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="font-bold text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Password Reset Successful!</span>
                  </div>
                  <div className="font-mono text-base font-bold bg-white px-3 py-2 rounded border border-emerald-300 text-emerald-800 select-all">
                    {resetResultTempPass}
                  </div>
                  <p className="text-xs text-emerald-700">New Argon2id hash successfully computed and updated.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setResettingUser(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password (leave blank to auto-generate)</label>
                  <input
                    type="password"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Leave blank for secure random generation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceChangeOnReset}
                    onChange={(e) => setForceChangeOnReset(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Force password change on next login</span>
                </label>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- Modal: Lock Account --- */}
      {lockingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">Lock User Account: {lockingUser.displayName}</h3>
              </div>
              <button onClick={() => setLockingUser(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lock Reason / Security Note *</label>
                <textarea
                  required
                  rows={3}
                  value={lockReasonInput}
                  onChange={(e) => setLockReasonInput(e.target.value)}
                  placeholder="e.g. Suspicious login attempts or administrative review pending..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLockingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!lockReasonInput) return;
                    store.lockUserAccount(lockingUser.id, lockReasonInput);
                    setLockingUser(null);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Lock Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: User Audit History --- */}
      {selectedUserAudit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900">Audit History: {selectedUserAudit.displayName} (@{selectedUserAudit.username})</h3>
              </div>
              <button onClick={() => setSelectedUserAudit(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.filter(log => log.entityId === selectedUserAudit.username || log.entityId === selectedUserAudit.id || log.details.includes(selectedUserAudit.displayName)).length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No specific audit logs found for this user.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.filter(log => log.entityId === selectedUserAudit.username || log.entityId === selectedUserAudit.id || log.details.includes(selectedUserAudit.displayName)).map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>{log.timestamp}</span>
                        <span className="font-bold text-slate-700">{log.action}</span>
                      </div>
                      <div className="text-slate-800 font-sans">{log.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserAudit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
