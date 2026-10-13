import type { ReactNode } from 'react';
import { brand } from '../../../src/theme';
import styles from './AppLayout.module.css';
import { Button } from './Button';
import { cx } from './cx';

interface AppLayoutProps {
  /** Zamaskowany kontakt konta („+48 602 *** 145” albo „d•••@…”). */
  contact: string | null;
  onLogout: () => void;
  loggingOut?: boolean;
  children: ReactNode;
}

export function AppLayout({ contact, onLogout, loggingOut = false, children }: AppLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={cx('eq-wordmark', styles.wordmark)}>{brand.wordmark}</span>
          <div className={styles.account}>
            {contact && (
              <span className={styles.signedInAs}>
                Zalogowano: <strong className="eq-num">{contact}</strong>
              </span>
            )}
            <Button variant="secondary" icon="logout" onClick={onLogout} disabled={loggingOut}>
              Wyloguj
            </Button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
