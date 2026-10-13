import { useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import { ButtonLink } from '../components/Button';
import { useDocumentTitle } from '../components/hooks';
import { Icon } from '../components/Icon';
import styles from './screens.module.css';
import { useSignedIn } from './signed-in';

/** PanelWitaj: osoba bez konta firmy i członkostwa (startView = welcome). */
export function WelcomeScreen() {
  useDocumentTitle('Witaj · EQUENOR');
  const { me, contact, logout, loggingOut } = useSignedIn();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  if (!me) return null;
  return (
    <AppLayout contact={contact} onLogout={logout} loggingOut={loggingOut}>
      <section className={styles.welcomeCard} aria-labelledby="welcome-title">
        <div className={styles.welcomeHead}>
          <div className={styles.welcomeMark} aria-hidden="true">
            <Icon name="horseshoe" size={28} />
          </div>
          <h1 id="welcome-title" className={styles.welcomeTitle} ref={titleRef} tabIndex={-1}>
            Witaj w EQUENOR, {me.displayName}
          </h1>
        </div>
        <ButtonLink to="/business/new" icon="plus">
          Załóż konto firmy
        </ButtonLink>
      </section>
    </AppLayout>
  );
}
