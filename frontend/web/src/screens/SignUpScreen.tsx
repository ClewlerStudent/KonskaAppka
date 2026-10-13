import { Link, useNavigate } from '@tanstack/react-router';
import { useRef, useState, type FormEvent } from 'react';
import type { Locale } from '../../../src/api/auth-api';
import { AuthLayout } from '../components/AuthLayout';
import { Button, linkStyles } from '../components/Button';
import {
  fieldStyles,
  PasswordField,
  PhoneField,
  SegmentedControl,
  TextField,
} from '../components/fields';
import { useDocumentTitle } from '../components/hooks';
import { Notice } from '../components/Notice';
import { errorMessage, messages } from '../errors';
import { useServices } from '../services';
import { loginFromDraft, type LoginKind } from '../session/sign-in-flow';
import { loginKindOptions } from './LoginScreen';
import styles from './screens.module.css';

/** Minimalna długość hasła (polityka IdP; serwer i tak odpowie 422 weak_password). */
export const MIN_PASSWORD_LENGTH = 10;

const localeOptions = [
  { value: 'pl', label: 'Polski', lang: 'pl' },
  { value: 'uk', label: 'Українська', lang: 'uk' },
  { value: 'en', label: 'English', lang: 'en' },
] as const satisfies readonly { value: Locale; label: string; lang: string }[];

type Field = 'login' | 'password' | 'name';
type FormError = { message: string; field?: Field };

/** PanelRejestracja: nowe konto; kod potwierdzenia na podany kontakt (PanelRejestracjaKod). */
export function SignUpScreen() {
  useDocumentTitle('Załóż konto · EQUENOR');
  const { api, flow } = useServices();
  const navigate = useNavigate();

  const [draft] = useState(() => flow.draft());
  const [kind, setKind] = useState<LoginKind>(draft.kind);
  const [phone, setPhone] = useState(draft.phone);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [locale, setLocale] = useState<Locale>('pl');
  const [error, setError] = useState<FormError | null>(null);
  const [busy, setBusy] = useState(false);
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const fail = (formError: FormError) => {
    setBusy(false);
    setError(formError);
    const refs = { login: loginRef, password: passwordRef, name: nameRef };
    if (formError.field) refs[formError.field].current?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const current = { kind, phone, email };
    flow.saveDraft(current);
    const login = loginFromDraft(current);
    const displayName = name.trim();
    if (!login.ok) {
      fail({
        message: login.field === 'phone' ? messages.phoneRequired : messages.emailRequired,
        field: 'login',
      });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      fail({ message: messages.weakPassword, field: 'password' });
      return;
    }
    if (displayName === '') {
      fail({ message: messages.nameRequired, field: 'name' });
      return;
    }

    setBusy(true);
    setError(null);
    const result = await api.signUp({ login: login.login, password, displayName, locale });
    if (result.ok) {
      const { channel, maskedContact } = result.data;
      flow.startSignUpConfirmation({ kind, login: login.login, channel, maskedContact });
      await navigate({ to: '/sign-up/code' });
      return;
    }
    fail({
      message: errorMessage(result.code, 'signUp'),
      field: result.code === 'weak_password' ? 'password' : undefined,
    });
  };

  return (
    <AuthLayout labelledBy="sign-up-title">
      <div className={styles.heading}>
        <h1 id="sign-up-title" className={styles.title}>
          Załóż konto
        </h1>
      </div>

      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        {error && <Notice tone="error">{error.message}</Notice>}

        <SegmentedControl
          label={{ text: 'Załóż konto przez' }}
          options={loginKindOptions}
          value={kind}
          onChange={(next) => {
            setKind(next);
            setError(null);
          }}
        />

        {kind === 'phone' ? (
          <PhoneField
            key="phone"
            label="Numer telefonu"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            invalid={error?.field === 'login'}
            inputRef={loginRef}
            autoFocus
          />
        ) : (
          <TextField
            key="email"
            label="Adres e-mail"
            type="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            invalid={error?.field === 'login'}
            inputRef={loginRef}
            autoFocus
          />
        )}

        <PasswordField
          label="Hasło"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={256}
          invalid={error?.field === 'password'}
          inputRef={passwordRef}
        />

        <TextField
          label="Imię i nazwisko"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          invalid={error?.field === 'name'}
          inputRef={nameRef}
        />

        <div className={fieldStyles.field}>
          <span id="sign-up-locale" className={fieldStyles.label}>
            Język aplikacji
          </span>
          <SegmentedControl
            label={{ labelledBy: 'sign-up-locale' }}
            options={localeOptions}
            value={locale}
            onChange={setLocale}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            Załóż konto
          </Button>
          <div className={linkStyles.row}>
            <Link to="/login" className={linkStyles.textLink}>
              Mam już konto
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
