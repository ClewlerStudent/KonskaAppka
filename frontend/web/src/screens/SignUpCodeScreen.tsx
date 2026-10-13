import { Link, Navigate, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { useDocumentTitle } from '../components/hooks';
import { Notice } from '../components/Notice';
import { ResendButton } from '../components/ResendButton';
import { errorMessage, messages } from '../errors';
import { useServices } from '../services';
import type { PendingSignUp } from '../session/sign-in-flow';
import { codeTexts } from './LoginCodeScreen';
import styles from './screens.module.css';

export const SIGN_UP_CODE_LENGTH = 8;

/** PanelRejestracjaKod: potwierdzenie konta kodem (8 cyfr), bez automatycznego logowania. */
export function SignUpCodeScreen() {
  const { flow } = useServices();
  const [pending] = useState(() => flow.pendingSignUp());
  if (!pending) return <Navigate to="/sign-up" replace />;
  return <SignUpCode initial={pending} />;
}

function SignUpCode({ initial }: { initial: PendingSignUp }) {
  useDocumentTitle('Potwierdź konto · EQUENOR');
  const { api, flow } = useServices();
  const navigate = useNavigate();
  const [pending, setPending] = useState(initial);
  const [code, setCode] = useState({ value: '', complete: false });
  const [attempt, setAttempt] = useState(0);
  const [sent, setSent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const texts = codeTexts(pending);

  const resend = async () => {
    setBusy(true);
    setError(null);
    setResent(false);
    const result = await api.resendSignUpCode(pending.login);
    setBusy(false);
    if (result.ok) {
      const next = { ...pending, ...result.data };
      flow.startSignUpConfirmation(next);
      setPending(next);
      setResent(true);
      setSent((n) => n + 1);
    } else {
      setError(errorMessage(result.code, 'signUpCode'));
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!code.complete) {
      setError(messages.codeIncomplete);
      return;
    }
    setBusy(true);
    setError(null);
    setResent(false);
    const result = await api.confirmSignUp(pending.login, code.value);
    if (result.ok) {
      flow.accountConfirmed();
      await navigate({ to: '/login' });
      return;
    }
    setBusy(false);
    if (result.code === 'invalid_code') {
      setCode({ value: '', complete: false });
      setAttempt((n) => n + 1);
    }
    setError(errorMessage(result.code, 'signUpCode'));
  };

  return (
    <AuthLayout labelledBy="confirm-title">
      <div className={styles.heading}>
        <h1 id="confirm-title" className={styles.title}>
          Potwierdź konto
        </h1>
        <p className={styles.subtitle}>
          Kod wysłaliśmy na <strong>{pending.maskedContact}</strong>.{' '}
          <Link to="/sign-up" className={styles.inlineLink}>
            {texts.change}
          </Link>
        </p>
      </div>

      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        {error && <Notice tone="error">{error}</Notice>}
        {resent && !error && <Notice tone="info">Wysłaliśmy nowy kod.</Notice>}
        <CodeInput
          key={attempt}
          length={SIGN_UP_CODE_LENGTH}
          legend={texts.legend}
          autoFocus
          onChange={(value, complete) => setCode({ value, complete })}
        />
        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            Potwierdź
          </Button>
          <ResendButton key={sent} onResend={() => void resend()} disabled={busy} />
        </div>
      </form>
    </AuthLayout>
  );
}
