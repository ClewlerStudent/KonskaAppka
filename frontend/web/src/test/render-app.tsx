import { createMemoryHistory } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mocked } from 'vitest';
import type { AuthApi } from '../../../src/api/auth-api';
import { App, createAppRouter } from '../router';
import type { Services } from '../services';
import { createSession } from '../session/session';
import { createSignInFlow } from '../session/sign-in-flow';
import { createFakeApi, ok, tokens } from './fake-api';

interface RenderAppOptions {
  api?: Mocked<AuthApi>;
  /** Ciasteczko z ważnym refresh tokenem: start strony kończy się zalogowaniem. */
  signedIn?: boolean;
  services?: Partial<Services>;
  user?: ReturnType<typeof userEvent.setup>;
}

// Router przewija stronę na górę po nawigacji; jsdom nie ma window.scrollTo.
window.scrollTo = () => undefined;

/** Cały panel (router w pamięci) z fałszywym API. */
export function renderApp(path: string, options: RenderAppOptions = {}) {
  const api = options.api ?? createFakeApi();
  if (options.signedIn) api.refresh.mockImplementation(() => Promise.resolve(ok(tokens())));
  const services: Services = {
    api,
    config: { apiBaseUrl: '', wwwUrl: 'https://equenor.example' },
    session: createSession(api),
    flow: createSignInFlow(),
    ...options.services,
  };
  const router = createAppRouter(services, createMemoryHistory({ initialEntries: [path] }));
  const user = options.user ?? userEvent.setup();
  render(<App services={services} router={router} />);
  const pathname = () => router.state.location.pathname;
  return { api, services, router, user, pathname };
}
