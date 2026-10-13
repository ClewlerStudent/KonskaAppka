import type { ReactNode } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';
import styles from './Notice.module.css';

interface NoticeProps {
  tone: 'error' | 'info';
  children: ReactNode;
}

/** Komunikat stanu: błąd (role="alert") albo informacja (role="status"). */
export function Notice({ tone, children }: NoticeProps) {
  return (
    <div className={cx(styles.notice, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'alert' : 'checkCircle'} size={18} />
      <div>{children}</div>
    </div>
  );
}
