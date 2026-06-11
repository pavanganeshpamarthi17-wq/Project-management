import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import { userService } from '../services/projectService';
import { FormGroup, Input, Textarea } from '../components/common/Form';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarColors = ['#4f8ef7', '#a78bfa', '#34d399', '#fbbf24'];
  const avatarColor = avatarColors[user?.name?.charCodeAt(0) % avatarColors.length] || avatarColors[0];

  const validateProfile = () => {
    const e = {};
    if (!profileForm.name.trim()) e.name = 'Name is required';
    else if (profileForm.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword) e.currentPassword = 'Current password is required';
    if (!pwForm.newPassword) e.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (pwForm.newPassword !== pwForm.confirm) e.confirm = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile({ name: profileForm.name.trim(), bio: profileForm.bio });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setSavingPw(true);
    try {
      await userService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const chPw = (k) => (e) => {
    setPwForm(f => ({ ...f, [k]: e.target.value }));
    if (pwErrors[k]) setPwErrors(er => ({ ...er, [k]: '' }));
  };

  return (
    <div className={styles.page}>
      <SEO title="Profile" description="View and update your personal user profile details, bio, password, and security preferences." />
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar} style={{ background: avatarColor }}>
              {initials}
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{user?.name}</h2>
              <p className={styles.userEmail}>{user?.email}</p>
              <div className={styles.userMeta}>
                <span className={styles.roleBadge}>{user?.role}</span>
                <span className={styles.joinDate}>Joined {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Log Out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
        {user?.bio && <p className={styles.bio}>{user.bio}</p>}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['profile', 'security'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'profile' ? '👤 Profile Info' : '🔒 Security'}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={styles.formCard}>
          <h3 className={styles.sectionTitle}>Edit Profile</h3>
          <form onSubmit={handleProfileSave} className={styles.form} noValidate>
            <FormGroup label="Full Name" required error={profileErrors.name}>
              <Input
                value={profileForm.name}
                onChange={e => { setProfileForm(f => ({ ...f, name: e.target.value })); if (profileErrors.name) setProfileErrors({}); }}
                placeholder="Your full name"
                error={profileErrors.name}
              />
            </FormGroup>
            <FormGroup label="Email Address" hint="Email cannot be changed">
              <Input value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </FormGroup>
            <FormGroup label="Bio" hint="A short description about yourself">
              <Textarea
                value={profileForm.bio}
                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell the team a bit about yourself…"
                rows={3}
              />
            </FormGroup>
            <div className={styles.formFooter}>
              <button type="submit" className={styles.saveBtn} disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className={styles.formCard}>
          <h3 className={styles.sectionTitle}>Change Password</h3>
          <form onSubmit={handlePasswordChange} className={styles.form} noValidate>
            <FormGroup label="Current Password" required error={pwErrors.currentPassword}>
              <Input
                type="password"
                value={pwForm.currentPassword}
                onChange={chPw('currentPassword')}
                placeholder="••••••••"
                error={pwErrors.currentPassword}
              />
            </FormGroup>
            <FormGroup label="New Password" required error={pwErrors.newPassword}>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={chPw('newPassword')}
                placeholder="At least 6 characters"
                error={pwErrors.newPassword}
              />
            </FormGroup>
            <FormGroup label="Confirm New Password" required error={pwErrors.confirm}>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={chPw('confirm')}
                placeholder="••••••••"
                error={pwErrors.confirm}
              />
            </FormGroup>
            <div className={styles.pwStrength}>
              {pwForm.newPassword && (
                <>
                  <span className={styles.strengthLabel}>Strength:</span>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={styles.strengthBar}
                        style={{
                          background: pwForm.newPassword.length >= i * 4
                            ? i === 1 ? 'var(--danger)' : i === 2 ? 'var(--warning)' : 'var(--success)'
                            : 'var(--border)'
                        }}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthText} style={{
                    color: pwForm.newPassword.length < 4 ? 'var(--danger)'
                      : pwForm.newPassword.length < 8 ? 'var(--warning)' : 'var(--success)'
                  }}>
                    {pwForm.newPassword.length < 4 ? 'Weak' : pwForm.newPassword.length < 8 ? 'Fair' : 'Strong'}
                  </span>
                </>
              )}
            </div>
            <div className={styles.formFooter}>
              <button type="submit" className={styles.saveBtn} disabled={savingPw}>
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Info */}
      <div className={styles.infoCard}>
        <h3 className={styles.sectionTitle}>Account Details</h3>
        <div className={styles.infoGrid}>
          {[
            { label: 'Account ID', value: user?._id, mono: true },
            { label: 'Role', value: user?.role },
            { label: 'Member Since', value: formatDate(user?.createdAt, 'MMMM d, yyyy') },
          ].map(({ label, value, mono }) => (
            <div key={label} className={styles.infoRow}>
              <span className={styles.infoLabel}>{label}</span>
              <span className={styles.infoValue} style={mono ? { fontFamily: 'var(--font-mono)', fontSize: '12px' } : {}}>
                {value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
