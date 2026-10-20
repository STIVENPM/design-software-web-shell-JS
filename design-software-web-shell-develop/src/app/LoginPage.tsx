import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LoginResponse { access_token: string }

export function LoginPage({ onLoggedIn }: { onLoggedIn: () => Promise<void> }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Credenciales inválidas.' : `Error de autenticación (${response.status}).`);
      const body = await response.json() as LoginResponse;
      if (!body.access_token) throw new Error('IAM no devolvió un token de acceso.');
      sessionStorage.setItem('sena.access_token', body.access_token);
      await onLoggedIn();
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from?.startsWith('/') && !from.startsWith('//') ? from : '/actors/', { replace: true });
    } catch (cause) {
      sessionStorage.removeItem('sena.access_token');
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return <main style={{ maxWidth: 420, margin: '10vh auto', padding: 24 }}>
    <h1>Iniciar sesión</h1>
    <form onSubmit={event => void submit(event)}>
      <label>Correo electrónico<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </main>;
}
