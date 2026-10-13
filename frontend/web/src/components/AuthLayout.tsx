import type { ReactNode } from 'react';
import { brand } from '../../../src/theme';
import { wwwLinks } from '../config';
import { useServices } from '../services';
import styles from './AuthLayout.module.css';
import { cx } from './cx';
import { Icon } from './Icon';

/** Znak EQUENOR z hasłem pod spodem: tylko na ekranach logowania (docs/paleta.md). */
export function BrandBlock() {
  return (
    <div className={styles.brand}>
      <div className={styles.brandMark} aria-hidden="true">
        <Icon name="horseshoe" size={30} />
      </div>
      <div className={styles.brandText}>
        <span className={cx('eq-wordmark', 'eq-wordmark--centered', styles.wordmark)}>
          {brand.wordmark}
        </span>
        <span className={cx('eq-tagline', styles.tagline)} lang="en">
          {brand.tagline}
        </span>
      </div>
    </div>
  );
}

export function FooterLinks() {
  const { config } = useServices();
  const links = wwwLinks(config.wwwUrl);
  return (
    <footer className={styles.footer}>
      <a href={links.home}>Strona EQUENOR</a>
      <a href={links.terms}>Regulamin</a>
      <a href={links.privacy}>Polityka prywatności</a>
    </footer>
  );
}

interface AuthLayoutProps {
  /** id nagłówka H1 karty (aria-labelledby). */
  labelledBy: string;
  children: ReactNode;
}

export function AuthLayout({ labelledBy, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby={labelledBy}>
          <BrandBlock />
          {children}
        </section>
      </main>
      <FooterLinks />
    </div>
  );
}
