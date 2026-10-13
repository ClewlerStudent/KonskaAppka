import { useId, useState, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from './cx';
import styles from './fields.module.css';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>;

interface FieldProps extends InputProps {
  label: string;
  invalid?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

/** Pole tekstowe z etykietą (e-mail, imię i nazwisko). */
export function TextField({ label, invalid = false, inputRef, ...input }: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control} data-invalid={invalid}>
        <input
          {...input}
          ref={inputRef}
          id={id}
          className={cx(styles.input, input.type === 'email' && styles.strong)}
          aria-invalid={invalid || undefined}
        />
      </div>
    </div>
  );
}

/** Numer telefonu ze stałym prefiksem +48 (numer krajowy, 9 cyfr). */
export function PhoneField({ label, invalid = false, inputRef, ...input }: FieldProps) {
  const id = useId();
  const prefixId = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control} data-invalid={invalid}>
        <span className={styles.prefix} id={prefixId}>
          +48
        </span>
        <input
          {...input}
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-describedby={prefixId}
          className={cx(styles.input, styles.strong, styles.numeric)}
          aria-invalid={invalid || undefined}
        />
      </div>
    </div>
  );
}

/** Hasło z przyciskiem „Pokaż” / „Ukryj”. */
export function PasswordField({ label, invalid = false, inputRef, ...input }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control} data-invalid={invalid}>
        <input
          {...input}
          ref={inputRef}
          id={id}
          type={visible ? 'text' : 'password'}
          autoCapitalize="off"
          spellCheck={false}
          className={styles.input}
          aria-invalid={invalid || undefined}
        />
        <button
          type="button"
          className={styles.reveal}
          aria-controls={id}
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Ukryj' : 'Pokaż'}
        </button>
      </div>
    </div>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  lang?: string;
}

interface SegmentedControlProps<T extends string> {
  /** Etykieta grupy: aria-label albo id widocznej etykiety. */
  label: { text: string } | { labelledBy: string };
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      {...('text' in label
        ? { 'aria-label': label.text }
        : { 'aria-labelledby': label.labelledBy })}
      className={cx(styles.segmented, options.length === 3 ? styles.segments3 : styles.segments2)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.segment}
          aria-pressed={option.value === value}
          lang={option.lang}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const fieldStyles = { label: styles.label, field: styles.field };
