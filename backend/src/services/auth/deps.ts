import type { Clock } from '../../kit/clock.js';
import type { AppEnv } from '../../kit/env.js';
import type { Logger } from '../../kit/logger.js';
import type { AccessRepository } from './access/access-repository.js';
import type { CodeSender } from './codes/code-sender.js';
import type { IdentityProvider } from './identity/identity-provider.js';
import type { TokenService } from './tokens/issue.js';
import type { Signer } from './tokens/signer.js';
import type { UserRepository } from './users/user-repository.js';

export interface AuthConfig {
  readonly appEnv: AppEnv;
  /** `iss` tokenów, np. `http://localhost:4010/auth/v1`. */
  readonly issuer: string;
  readonly allowedOrigins: readonly string[];
  readonly host: string;
  readonly port: number;
  readonly jwksPort: number;
  readonly trustProxy: boolean;
  readonly rateLimitFactor: number;
}

/** Zależności serwisu auth; main.ts składa je z env, testy z adapterów w pamięci. */
export interface AuthDeps {
  readonly config: AuthConfig;
  readonly logger: Logger;
  readonly clock: Clock;
  readonly signer: Signer;
  readonly idp: IdentityProvider;
  readonly codes: CodeSender;
  readonly users: UserRepository;
  readonly access: AccessRepository;
}

export interface RouteDeps extends AuthDeps {
  readonly tokens: TokenService;
}
