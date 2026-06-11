import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const change = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
  };

  return (
    <div className={styles.page}>
      <SEO title="Register" description="Create a ProjectFlow account to get started organizing your team's tasks and tracking project statistics." />
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z" opacity="0.4"/>
              <path d="M5 5h3v3H5V5zm11 0h3v3h-3V5zm0 11h3v3h-3v-3zM5 16h3v3H5v-3z"/>
            </svg>
          </div>
          <span>ProjectFlow</span>
        </div>

        <div className={styles.header}>
          <h1>Create account</h1>
          <p>Start managing your projects today</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {[
            { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••' }
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className={styles.field}>
              <label>{label}</label>
              <input
                type={type} placeholder={placeholder}
                value={form[key]} onChange={change(key)}
                className={errors[key] ? styles.inputError : ''}
              />
              {errors[key] && <span className={styles.error}>{errors[key]}</span>}
            </div>
          ))}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><Spinner /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText} style={{ marginTop: '24px' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.3"/>
    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
