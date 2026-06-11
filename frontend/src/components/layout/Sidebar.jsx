import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import styles from './Sidebar.module.css';

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    onClick={onClick}
  >
    <span className={styles.navIcon}>{icon}</span>
    <span className={styles.navLabel}>{label}</span>
  </NavLink>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z" fill="currentColor" opacity="0.3"/>
            <path d="M5 5h3v3H5V5zm11 0h3v3h-3V5zm0 11h3v3h-3v-3zM5 16h3v3H5v-3z" fill="currentColor"/>
          </svg>
        </div>
        <span className={styles.brandName}>ProjectFlow</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.sectionLabel}>Main</span>
          <NavItem to="/dashboard" icon={<IconDashboard />} label="Dashboard" onClick={onClose} />
          <NavItem to="/projects" icon={<IconProjects />} label="Projects" onClick={onClose} />
          <NavItem to="/tasks" icon={<IconTasks />} label="Tasks" onClick={onClose} />
        </div>

        <div className={styles.navSection}>
          <span className={styles.sectionLabel}>Account</span>
          <NavItem to="/profile" icon={<IconProfile />} label="Profile" onClick={onClose} />
        </div>
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {getInitials(user?.name)}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <IconLogout />
        </button>
      </div>
    </aside>
  );
}

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconProjects = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7a2 2 0 012-2h3l2 3h9a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
  </svg>
);

const IconTasks = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
