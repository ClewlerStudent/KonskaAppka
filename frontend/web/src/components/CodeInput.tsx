import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cx } from './cx';
import styles from './fields.module.css';

interface CodeInputProps {
  length: 6 | 8;
  legend: string;
  onChange: (code: string, complete: boolean) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/**
 * Kod jednorazowy: N komórek po jednej cyfrze. Wpisanie przenosi fokus dalej, Backspace cofa,
 * wklejenie albo autouzupełnienie (one-time-code w pierwszej komórce) wypełnia kolejne komórki.
 * Czyszczenie: rodzic montuje komponent od nowa (zmiana `key`).
 */
export function CodeInput({ length, legend, onChange, autoFocus, disabled }: CodeInputProps) {
  const [cells, setCells] = useState<string[]>(() => Array.from({ length }, () => ''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => {
    const input = inputs.current[Math.max(0, Math.min(length - 1, index))];
    input?.focus();
    input?.select();
  };

  const update = (next: string[]) => {
    setCells(next);
    const code = next.join('');
    onChange(code, code.length === length);
  };

  /** Wpisuje cyfry od komórki `start`; zwraca indeks następnej komórki. */
  const fill = (start: number, digits: string): number => {
    const next = [...cells];
    let index = start;
    for (const digit of digits) {
      if (index >= length) break;
      next[index] = digit;
      index += 1;
    }
    update(next);
    return index;
  };

  const handleInput = (index: number, raw: string) => {
    const digits = onlyDigits(raw);
    const previous = cells[index] ?? '';
    if (digits.length === 0) {
      if (raw === '') update(cells.map((c, i) => (i === index ? '' : c)));
      return;
    }
    if (digits.length >= length) {
      focusCell(fill(0, digits.slice(0, length)));
      return;
    }
    // Druga cyfra w zajętej komórce: nowa zastępuje starą (kursor przed albo za starą cyfrą).
    const typed =
      digits.length === 2 && previous !== '' && digits.includes(previous)
        ? digits[0] === previous
          ? digits.slice(1)
          : digits.slice(0, 1)
        : digits;
    focusCell(fill(index, typed));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && (cells[index] ?? '') === '' && index > 0) {
      event.preventDefault();
      update(cells.map((c, i) => (i === index - 1 ? '' : c)));
      focusCell(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusCell(index - 1);
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = onlyDigits(event.clipboardData.getData('text'));
    event.preventDefault();
    if (digits.length === 0) return;
    const start = digits.length >= length ? 0 : index;
    focusCell(fill(start, digits.slice(0, length - start)));
  };

  return (
    <fieldset className={styles.code} disabled={disabled}>
      <legend className={styles.codeLegend}>{legend}</legend>
      <div className={cx(styles.codeCells, length === 8 ? styles.codeCells8 : styles.codeCells6)}>
        {cells.map((value, index) => (
          <label key={index} className={styles.codeCell}>
            <span className="eq-visually-hidden">
              Cyfra {index + 1} z {length}
            </span>
            <input
              ref={(el) => {
                inputs.current[index] = el;
              }}
              className={styles.codeInput}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              pattern="[0-9]*"
              value={value}
              autoFocus={autoFocus && index === 0}
              onChange={(event) => handleInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={(event) => event.target.select()}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
