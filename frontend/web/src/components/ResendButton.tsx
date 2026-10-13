import { Button } from './Button';
import { formatCountdown, useCountdown } from './hooks';

/** Odstęp przed ponownym wysłaniem kodu. */
export const RESEND_AFTER_S = 60;

interface ResendButtonProps {
  onResend: () => void;
  disabled?: boolean;
}

/** „Wyślij kod ponownie za 0:42”, po odliczeniu aktywny „Wyślij kod ponownie”. */
export function ResendButton({ onResend, disabled = false }: ResendButtonProps) {
  const remaining = useCountdown(RESEND_AFTER_S);
  if (remaining > 0) {
    return (
      <Button variant="quiet" icon="timer" disabled>
        <span>
          Wyślij kod ponownie za <span className="eq-num">{formatCountdown(remaining)}</span>
        </span>
      </Button>
    );
  }
  return (
    <Button variant="quiet" icon="timer" onClick={onResend} disabled={disabled}>
      Wyślij kod ponownie
    </Button>
  );
}
