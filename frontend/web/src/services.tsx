import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { AuthApi } from '../../src/api/auth-api';
import type { PanelConfig } from './config';
import type { Session, SessionSnapshot } from './session/session';
import type { SignInFlow } from './session/sign-in-flow';

/** Zależności panelu; testy podstawiają fałszywe API i zegar. */
export interface Services {
  api: AuthApi;
  session: Session;
  flow: SignInFlow;
  config: PanelConfig;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext value={services}>{children}</ServicesContext>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('ServicesProvider is missing');
  return services;
}

export function useSessionSnapshot(): SessionSnapshot {
  const { session } = useServices();
  return useSyncExternalStore(session.subscribe, session.getSnapshot);
}
