import { Link, type LinkProps } from '@tanstack/react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IconName } from '../../../src/theme';
import styles from './Button.module.css';
import { cx } from './cx';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'quiet';

const iconSize: Record<Variant, number> = { primary: 20, secondary: 18, quiet: 18 };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: IconName;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  icon,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...rest}>
      {icon && <Icon name={icon} size={iconSize[variant]} />}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  to: LinkProps['to'];
  variant?: Variant;
  icon?: IconName;
  children: ReactNode;
}

export function ButtonLink({ to, variant = 'primary', icon, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={cx(styles.button, styles[variant])}>
      {icon && <Icon name={icon} size={iconSize[variant]} />}
      {children}
    </Link>
  );
}

export const linkStyles = {
  textLink: styles.textLink,
  row: styles.textLinkRow,
  end: styles.textLinkEnd,
};
