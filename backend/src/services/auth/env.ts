import { z } from 'zod';
import { baseEnvSchema, envBoolean, envPort, forbidInProd, refineBaseEnv } from '../../kit/env.js';

/**
 * Env serwisu auth (plan D.2). Adaptery dev (FAKE IdP, skrzynka dev, klucz efemeryczny)
 * blokują start w prod: auth celowo nie wystartuje w prod, dopóki nie ma adapterów produkcyjnych.
 */
export const authEnvSchema = baseEnvSchema
  .extend({
    /** Port wewnętrzny z JWKS (tylko w klastrze, poza Ingressem). */
    JWKS_PORT: envPort.default(8081),
    AUTH_ISSUER: z.url(),
    SIGNING_KEY_FILE: z.string().min(1).optional(),
    SIGNING_KEY_PEM: z.string().min(1).optional(),
    SIGNING_KEY_EPHEMERAL: envBoolean.default(false),
    IDP: z.enum(['fake', 'zitadel']),
    ZITADEL_API_URL: z.url().optional(),
    ZITADEL_SERVICE_KEY_FILE: z.string().min(1).optional(),
    DEV_DEMO_PASSWORD: z.string().min(10).max(256).optional(),
    CODE_SENDER: z.enum(['dev-inbox']),
    DEV_INBOX_FILE: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    refineBaseEnv(env, ctx);
    const prod = env.APP_ENV === 'prod';
    forbidInProd(ctx, 'SIGNING_KEY_EPHEMERAL', prod && env.SIGNING_KEY_EPHEMERAL);
    forbidInProd(ctx, 'IDP', prod && env.IDP === 'fake');
    forbidInProd(ctx, 'CODE_SENDER', prod && env.CODE_SENDER === 'dev-inbox');

    const keySources = [
      env.SIGNING_KEY_FILE !== undefined,
      env.SIGNING_KEY_PEM !== undefined,
      env.SIGNING_KEY_EPHEMERAL,
    ].filter(Boolean).length;
    if (keySources !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['SIGNING_KEY_FILE'],
        message: 'set exactly one of SIGNING_KEY_FILE, SIGNING_KEY_PEM, SIGNING_KEY_EPHEMERAL=true',
      });
    }

    const require = (variable: keyof typeof env, when: string) => {
      if (env[variable] === undefined) {
        ctx.addIssue({ code: 'custom', path: [variable], message: `required when ${when}` });
      }
    };
    if (env.IDP === 'fake') require('DEV_DEMO_PASSWORD', 'IDP=fake');
    if (env.IDP === 'zitadel') {
      require('ZITADEL_API_URL', 'IDP=zitadel');
      require('ZITADEL_SERVICE_KEY_FILE', 'IDP=zitadel');
    }
    if (env.CODE_SENDER === 'dev-inbox') require('DEV_INBOX_FILE', 'CODE_SENDER=dev-inbox');

    if (env.PORT !== 0 && env.PORT === env.JWKS_PORT) {
      ctx.addIssue({ code: 'custom', path: ['JWKS_PORT'], message: 'must differ from PORT' });
    }
  });

export type AuthEnv = z.output<typeof authEnvSchema>;
