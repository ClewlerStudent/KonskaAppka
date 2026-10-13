import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button, linkStyles } from '../components/Button';
import { PasswordField, PhoneField, SegmentedControl, TextField } from '../components/fields';
import { useDocumentTitle } from '../components/hooks';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { errorMessage, messages } from '../errors';
import { useServices } from '../services';
import { loginFromDraft, type LoginKind } from '../session/sign-in-flow';
import styles from './screens.module.css';

export const loginKindOptions = [
  { value: 'phone', label: 'Telefon', icon: <Icon name="phone" /> },
  { value: 'email', label: 'E-mail', icon: <Icon name="mail" /> },
] as const;

type FormError = { message: string; field?: 'login' | 'password' };

/** PanelLogowanie: telefon albo e-mail i hasło; potem krok MFA (PanelLogowanieKod). */
export function LoginScreen() {
  useDocumentTitle('Logowanie · EQUENOR');
  const { api, flow } = useServices();
  const navigate = useNavigate();

  const [draft] = useState(() => flow.draft());
  const [hints] = useState(() => flow.loginHints());
  const [kind, setKind] = useState<LoginKind>(draft.kind);
  const [phone, setPhone] = useState(draft.phone);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [busy, setBusy] = useState(false);
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    flow.clearLoginHints();
  }, [flow]);

  const fail = (formError: FormError) => {
    setBusy(false);
    setError(formError);
    if (formError.field === 'login') loginRef.current?.focus();
    if (formError.field === 'password') passwordRef.current?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const current = { kind, phone, email };
    flow.saveDraft(current);
    const login = loginFromDraft(current);
    if (!login.ok) {
      fail({
        message: login.field === 'phone' ? messages.phoneRequired : messages.emailRequired,
        field: 'login',
      });
      return;
    }
    if (password === '') {
      fail({ message: messages.passwordRequired, field: 'password' });
      return;
    }

    setBusy(true);
    setError(null);
    const result = await api.login(login.login, password);
    if (result.ok) {
      const { loginToken, channel, maskedContact } = result.data;
      flow.startMfa({ kind, loginToken, channel, maskedContact });
      await navigate({ to: '/login/code' });
      return;
    }
    if (result.code === 'account_not_confirmed') {
      const resent = await api.resendSignUpCode(login.login);
      if (resent.ok) {
        const { channel, maskedContact } = resent.data;
        flow.startSignUpConfirmation({ kind, login: login.login, channel, maskedContact });
        await navigate({ to: '/sign-up/code' });
        return;
      }
      fail({ message: errorMessage(resent.code, 'login') });
      return;
    }
    if (result.code === 'invalid_credentials') setPassword('');
    fail({
      message: errorMessage(result.code, 'login'),
      field: result.code === 'invalid_credentials' ? 'password' : undefined,
    });
  };

  const changeKind = (next: LoginKind) => {
    setKind(next);
    setError(null);
  };

  const loginInvalid = error?.field === 'login';
  const passwordInvalid = error?.field === 'password';

  return (
    <AuthLayout labelledBy="login-title">
      <div className={styles.heading}>
        <h1 id="login-title" className={styles.title}>
          Zaloguj się do panelu stajni
        </h1>
      </div>

      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        {hints.accountConfirmed && !error && (
          <Notice tone="info">Konto potwierdzone. Zaloguj się.</Notice>
        )}
        {error && <Notice tone="error">{error.message}</Notice>}

        <SegmentedControl
          label={{ text: 'Zaloguj się przez' }}
          options={loginKindOptions}
          value={kind}
          onChange={changeKind}
        />

        {kind === 'phone' ? (
          <PhoneField
            key="phone"
            label="Numer telefonu"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            invalid={loginInvalid}
            inputRef={loginRef}
            autoFocus={!hints.focusPassword}
          />
        ) : (
          <TextField
            key="email"
            label="Adres e-mail"
            type="email"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            invalid={loginInvalid}
            inputRef={loginRef}
            autoFocus={!hints.focusPassword}
          />
        )}

        <PasswordField
          label="Hasło"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={256}
          invalid={passwordInvalid}
          inputRef={passwordRef}
          autoFocus={hints.focusPassword}
        />
        <div className={linkStyles.end}>
          <Link to="/forgot-password">Nie pamiętam hasła</Link>
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            Zaloguj się
          </Button>
          <div className={linkStyles.row}>
            <Link to="/sign-up" className={linkStyles.textLink}>
              Załóż konto
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
