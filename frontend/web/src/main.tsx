import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/theme/theme.css';
import '../../src/theme/fonts.css';
import '../../src/theme/base.css';
import { createAuthApi } from '../../src/api/auth-api';
import { readConfig } from './config';
import { App, createAppRouter } from './router';
import { createSession } from './session/session';
import { createSignInFlow } from './session/sign-in-flow';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

const config = readConfig();
const api = createAuthApi(config.apiBaseUrl);
const services = { api, config, session: createSession(api), flow: createSignInFlow() };
const router = createAppRouter(services);

createRoot(root).render(
  <StrictMode>
    <App services={services} router={router} />
  </StrictMode>,
);
