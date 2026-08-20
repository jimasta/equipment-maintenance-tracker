import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApiError } from '../lib/api';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; senha?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = 'Informe seu e-mail';
    if (!senha) errors.senha = 'Informe sua senha';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), senha);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Equipment Tracker</span>
          <span className={styles.brandSubtitle}>Entre para acessar o painel de manutenção</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={submitting}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={fieldErrors.senha}
            disabled={submitting}
          />

          <Button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
