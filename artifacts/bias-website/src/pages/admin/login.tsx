import { useState, useEffect, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminLogin() {
  const { login, user, loading } = useAdminAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/admin/dashboard');
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setPending(false);
    }
  };

  if (loading) return (
    <div className="adm-login-page">
      <div className="adm-loading-spinner" />
    </div>
  );

  return (
    <div className="adm-login-page">
      {/* Background glows */}
      <div className="adm-login-glow adm-login-glow-1" />
      <div className="adm-login-glow adm-login-glow-2" />

      <form className="adm-login-card" onSubmit={handleSubmit}>
        {/* Logo */}
        <div className="adm-login-logo">
          <span className="adm-logo-dot" />
          <span className="adm-login-brand">Bias<em>.tech</em></span>
        </div>
        <h1 className="adm-login-title">لوحة التحكم</h1>
        <p className="adm-login-sub">تسجيل الدخول للوحة الإدارة</p>

        {error && (
          <div className="adm-alert adm-alert-error">{error}</div>
        )}

        <div className="b-fg">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@bias.tech"
            required
            autoComplete="email"
            dir="ltr"
          />
        </div>

        <div className="b-fg">
          <label htmlFor="password">كلمة المرور</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            dir="ltr"
          />
        </div>

        <button type="submit" className="b-form-submit" disabled={pending}>
          {pending ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>

        <p className="adm-login-back">
          <a href="/" className="adm-back-link">← العودة للموقع</a>
        </p>
      </form>
    </div>
  );
}
