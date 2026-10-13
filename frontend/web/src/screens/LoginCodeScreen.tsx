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
import { homePath } from '../session/home';
import type { CodeTarget, MfaChallenge } from '../session/sign-in-flow';
import styles from './screens.module.css';

export const MFA_CODE_LENGTH = 6;

export function codeTexts(target: CodeTarget) {
  const sms = target.channel === 'sms';
  return {
    legend: sms ? 'Kod z SMS' : 'Kod z e-maila',
    change: target.kind === 'phone' ? 'Zmień numer' : 'Zmień e-mail',
  };
}

type CodeError = { message: string; expired?: boolean };

/** PanelLogowanieKod: krok MFA (6 cyfr) z tokenem logowania z poprzedniego ekranu. */
export function LoginCodeScreen() {
  const { flow } = useServices();
  const [challenge] = useState(() => flow.challenge());
  if (!challenge) return <Navigate to="/login" replace />;
  return <LoginCode challenge={challenge} />;
}

function LoginCode({ challenge }: { challenge: MfaChallenge }) {
  useDocumentTitle('Kod logowania · EQUENOR');
  const { api, session, flow } = useServices();
  const navigate = useNavigate();
  const [code, setCode] = useState({ value: '', complete: false });
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<CodeError | null>(null);
  const [busy, setBusy] = useState(false);
  const texts = codeTexts(challenge);

  const backToPassword = () => {
    flow.backToPassword();
    void navigate({ to: '/login' });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!code.complete) {
      setError({ message: messages.codeIncomplete });
      return;
    }
    setBusy(true);
    setError(null);
    const result = await api.loginMfa(challenge.loginToken, code.value);
    if (result.ok) {
      const me = await session.completeLogin(result.data);
      if (me.ok) {
        flow.reset();
        await navigate({ to: homePath(me.data) });
        return;
      }
      setBusy(false);
      setError({ message: errorMessage(me.code, 'login') });
      return;
    }
    setBusy(false);
    if (result.code === 'invalid_code') {
      setCode({ value: '', complete: false });
      setAttempt((n) => n + 1);
    }
    setError({
      message: errorMessage(result.code, 'loginCode'),
      expired: result.code === 'invalid_token',
    });
  };

  return (
    <AuthLayout labelledBy="code-title">
      <div className={styles.heading}>
        <h1 id="code-title" className={styles.title}>
          {challenge.channel === 'sms' ? 'Wpisz kod z SMS' : 'Wpisz kod z e-maila'}
        </h1>
        <p className={styles.subtitle}>
          Kod wysłaliśmy na <strong>{challenge.maskedContact}</strong>.{' '}
          <Link to="/login" className={styles.inlineLink}>
            {texts.change}
          </Link>
        </p>
      </div>

      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        {error && (
          <Notice tone="error">
            {error.expired ? (
              <>
                Kod wygasł.{' '}
                <Link to="/login" onClick={() => flow.backToPassword()}>
                  Zaloguj się ponownie
                </Link>
                .
              </>
            ) : (
              error.message
            )}
          </Notice>
        )}
        <CodeInput
          key={attempt}
          length={MFA_CODE_LENGTH}
          legend={texts.legend}
          autoFocus
          onChange={(value, complete) => setCode({ value, complete })}
        />
        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            Zaloguj się
          </Button>
          <ResendButton onResend={backToPassword} />
        </div>
      </form>
    </AuthLayout>
  );
}
