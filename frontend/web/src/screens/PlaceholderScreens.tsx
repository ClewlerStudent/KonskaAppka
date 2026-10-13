import { Link } from '@tanstack/react-router';
import { AppLayout } from '../components/AppLayout';
import { AuthLayout } from '../components/AuthLayout';
import { linkStyles } from '../components/Button';
import { useDocumentTitle } from '../components/hooks';
import styles from './screens.module.css';
import { useSignedIn } from './signed-in';

/** Zaślepka resetu hasła (PanelResetHasla w kolejnym kroku). */
export function ForgotPasswordScreen() {
  useDocumentTitle('Nie pamiętam hasła · EQUENOR');
  return (
    <AuthLayout labelledBy="forgot-title">
      <div className={styles.heading}>
        <h1 id="forgot-title" className={styles.title}>
          Nie pamiętam hasła
        </h1>
      </div>
      <div className={linkStyles.row}>
        <Link to="/login" className={linkStyles.textLink}>
          Wróć do logowania
        </Link>
      </div>
    </AuthLayout>
  );
}

/** Zaślepka rejestracji firmy (PanelRejestracjaFirmy w kolejnym kroku). */
export function BusinessNewScreen() {
  useDocumentTitle('Załóż konto firmy · EQUENOR');
  const { me, contact, logout, loggingOut } = useSignedIn();
  if (!me) return null;
  return (
    <AppLayout contact={contact} onLogout={logout} loggingOut={loggingOut}>
      <section className={styles.welcomeCard} aria-labelledby="business-title">
        <div className={styles.heading}>
          <h1 id="business-title" className={styles.title}>
            Załóż konto firmy
          </h1>
          <p className={styles.subtitle}>Ten krok jest w przygotowaniu.</p>
        </div>
        <div className={linkStyles.row}>
          <Link to="/welcome" className={linkStyles.textLink}>
            ← Wróć
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export function NotFoundScreen() {
  useDocumentTitle('Nie ma takiej strony · EQUENOR');
  return (
    <AuthLayout labelledBy="not-found-title">
      <div className={styles.heading}>
        <h1 id="not-found-title" className={styles.title}>
          Nie ma takiej strony
        </h1>
      </div>
      <div className={linkStyles.row}>
        <Link to="/" className={linkStyles.textLink}>
          Przejdź do panelu
        </Link>
      </div>
    </AuthLayout>
  );
}
