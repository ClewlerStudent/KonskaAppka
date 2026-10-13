import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { MeResponse } from '../../../src/api/auth-api';
import { useServices, useSessionSnapshot } from '../services';

/**
 * Profil zalogowanej osoby i wylogowanie. Gdy sesja wygaśnie w trakcie (odświeżenie odrzucone),
 * ekran wraca do logowania.
 */
export function useSignedIn(): {
  me: MeResponse | null;
  contact: string | null;
  logout: () => void;
  loggingOut: boolean;
} {
  const { session, flow } = useServices();
  const { status, me } = useSessionSnapshot();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') void navigate({ to: '/login' });
  }, [status, navigate]);

  const logout = () => {
    setLoggingOut(true);
    void session.logout().then(() => {
      flow.reset();
      return navigate({ to: '/login' });
    });
  };

  const contact = me ? (me.contact.phoneMasked ?? me.contact.emailMasked) : null;
  return { me, contact, logout, loggingOut };
}
