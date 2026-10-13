import { readFileSync } from 'node:fs';
import { systemClock } from '../../kit/clock.js';
import { EnvError, loadEnv } from '../../kit/env.js';
import { createLogger } from '../../kit/logger.js';
import { installShutdown } from '../../kit/service.js';
import { MemoryAccessRepository } from './access/memory-access.js';
import { buildAuthApp } from './app.js';
import { createDevInboxCodeSender } from './codes/dev-inbox.js';
import { authEnvSchema, type AuthEnv } from './env.js';
import { seedDemoUsers } from './identity/demo-users.js';
import { FakeIdentityProvider } from './identity/fake-idp.js';
import { createSigner, generateEphemeralSigningKey, loadSigningKey } from './tokens/signer.js';
import { MemoryUserRepository } from './users/memory-users.js';

// Start serwisu auth: npm run dev:auth (tsx, .local/dev.env), serve:auth (E2E), start:auth (obraz).

function readEnv(): AuthEnv {
  try {
    return loadEnv(authEnvSchema);
  } catch (error) {
    if (error instanceof EnvError) {
      console.error(`auth: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const env = readEnv();
  const logger = createLogger({ service: 'auth', level: env.LOG_LEVEL, pretty: env.LOG_PRETTY });
  const clock = systemClock;

  if (env.IDP === 'zitadel') {
    throw new Error('ZITADEL adapter not implemented (spike 11.4 pkt 1)');
  }

  const privateKey = env.SIGNING_KEY_EPHEMERAL
    ? generateEphemeralSigningKey()
    : loadSigningKey(env.SIGNING_KEY_PEM ?? readFileSync(env.SIGNING_KEY_FILE ?? '', 'utf8'));
  const signer = await createSigner(privateKey);

  const idp = new FakeIdentityProvider(clock);
  await seedDemoUsers(idp, env.DEV_DEMO_PASSWORD ?? '');

  const service = await buildAuthApp({
    config: {
      appEnv: env.APP_ENV,
      issuer: env.AUTH_ISSUER,
      allowedOrigins: env.ALLOWED_ORIGINS,
      host: env.HOST,
      port: env.PORT,
      jwksPort: env.JWKS_PORT,
      trustProxy: env.TRUST_PROXY,
      rateLimitFactor: env.RATE_LIMIT_FACTOR,
    },
    logger,
    clock,
    signer,
    idp,
    codes: createDevInboxCodeSender(env.DEV_INBOX_FILE ?? '', clock),
    users: new MemoryUserRepository(),
    access: new MemoryAccessRepository(),
  });

  installShutdown(service, logger);
  const addresses = await service.listen();
  logger.info(
    { kid: signer.kid, idp: env.IDP, codeSender: env.CODE_SENDER, ...addresses },
    'auth listening',
  );
}

main().catch((error: unknown) => {
  console.error('auth: failed to start', error);
  process.exit(1);
});
