import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
      <SEO title="Log In" description="Sign in to your ProjectFlow workspace to manage projects and track tasks." />
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
          <h1>Welcome back</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email" placeholder="you@example.com"
              value={form.email} onChange={change('email')}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password" placeholder="••••••••"
              value={form.password} onChange={change('password')}
              className={errors.password ? styles.inputError : ''}
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <><Spinner /> Signing in…</>
            ) : 'Sign in'}
          </button>
        </form>

        <div className={styles.demo}>
          <div className={styles.demoLine} />
          <span>Demo credentials</span>
          <div className={styles.demoLine} />
        </div>
        <div className={styles.demoCreds}>
          <button onClick={() => setForm({ email: 'demo@projectflow.app', password: 'demo123456' })}
            className={styles.demoBtn}>
            Use demo account
          </button>
        </div>

        <p className={styles.switchText}>
          Don't have an account? <Link to="/register">Create one</Link>
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
