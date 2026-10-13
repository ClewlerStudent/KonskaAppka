import { z } from 'zod';
import { defineRoute } from '../kit/route.js';
import {
  ClientIdSchema,
  Code6Schema,
  Code8Schema,
  CodeChannelSchema,
  LocaleSchema,
  LoginSchema,
} from './common.js';

/** Ciasteczko z refresh tokenem panelu web (tylko `client_id = web`). */
export const REFRESH_COOKIE = {
  name: '__Secure-eq_rt',
  path: '/auth/v1/token',
} as const;

const SET_COOKIE_RT = `${REFRESH_COOKIE.name}=…; Path=${REFRESH_COOKIE.path}; HttpOnly; Secure; SameSite=Strict (tylko web)`;

export const SignUpRequest = z.object({
  login: LoginSchema,
  password: z
    .string()
    .min(1)
    .max(256)
    .describe('Co najmniej 10 znaków (inaczej 422 weak_password)'),
  displayName: z.string().trim().min(1).max(100),
  locale: LocaleSchema,
  clientId: ClientIdSchema,
});

export const CodeSentResponse = z.object({
  channel: CodeChannelSchema,
  maskedContact: z.string().describe('Np. +48 602 *** 145 albo d•••@stajnielipowe.pl'),
});

export const SignUpConfirmRequest = z.object({
  login: LoginSchema,
  code: Code8Schema,
});

export const SignUpResendRequest = z.object({
  login: LoginSchema,
});

export const LoginRequest = z.object({
  login: LoginSchema,
  password: z.string().min(1).max(256),
  clientId: ClientIdSchema,
});

export const LoginResponse = z.object({
  loginToken: z.string().describe('Token logowania (login+jwt) do kroku MFA'),
  channel: CodeChannelSchema,
  maskedContact: z.string(),
  expiresIn: z.number().int().positive().describe('Sekundy do wygaśnięcia tokenu logowania'),
});

export const MfaRequest = z.object({
  code: Code6Schema,
});

export const TokenResponse = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
  refreshToken: z
    .string()
    .optional()
    .describe('Tylko mobile i tablet; panel web dostaje refresh token w ciasteczku'),
});

export const TokenRequest = z.object({
  grantType: z.literal('refresh_token'),
  refreshToken: z
    .string()
    .min(1)
    .max(4096)
    .optional()
    .describe('Mobile i tablet; bez pola: ciasteczko i nagłówek X-Equenor-Client: web'),
});

export const StartView = z.enum(['welcome']);

export const MeResponse = z.object({
  id: z.uuid(),
  displayName: z.string(),
  locale: LocaleSchema,
  contact: z.object({
    phoneMasked: z.string().nullable(),
    emailMasked: z.string().nullable(),
  }),
  businesses: z.array(z.uuid()),
  startView: StartView.describe('Nowe wartości dochodzą addytywnie; nieznana = unknown'),
});

export const JwksResponse = z.object({
  keys: z.array(
    z.object({
      kty: z.literal('EC'),
      crv: z.literal('P-256'),
      x: z.string(),
      y: z.string(),
      kid: z.string(),
      alg: z.literal('ES256'),
      use: z.literal('sig'),
    }),
  ),
});

/** Schematy w components.schemas OpenAPI (bez schematów tras wewnętrznych). */
export const authSchemas = {
  SignUpRequest,
  CodeSentResponse,
  SignUpConfirmRequest,
  SignUpResendRequest,
  LoginRequest,
  LoginResponse,
  MfaRequest,
  TokenRequest,
  TokenResponse,
  StartView,
  MeResponse,
} as const;

const HOUR = 3600;
const MIN15 = 900;
const MIN5 = 300;

export const signUp = defineRoute({
  kind: 'open',
  operationId: 'signUp',
  method: 'POST',
  path: '/auth/v1/sign-up',
  summary: 'Rejestracja konta: kod potwierdzenia na podany kontakt',
  open: {
    reason: 'Rejestracja: konta jeszcze nie ma',
    rateLimit: [
      { by: 'ip', max: 10, windowSec: HOUR },
      { by: 'login', max: 3, windowSec: HOUR },
    ],
  },
  body: SignUpRequest,
  responses: {
    202: {
      description: 'Kod wysłany; ta sama odpowiedź bez względu na to, czy konto istnieje',
      schema: CodeSentResponse,
    },
  },
  errors: [
    'validation_failed',
    'weak_password',
    'origin_not_allowed',
    'client_not_allowed',
    'rate_limited',
  ],
});

export const confirmSignUp = defineRoute({
  kind: 'open',
  operationId: 'confirmSignUp',
  method: 'POST',
  path: '/auth/v1/sign-up/confirm',
  summary: 'Potwierdzenie konta kodem (8 cyfr); bez automatycznego logowania',
  open: {
    reason: 'Rejestracja: konto jeszcze niepotwierdzone',
    rateLimit: [
      { by: 'ip', max: 20, windowSec: MIN15 },
      { by: 'login', max: 10, windowSec: MIN15 },
    ],
  },
  body: SignUpConfirmRequest,
  responses: { 204: { description: 'Konto potwierdzone' } },
  errors: ['validation_failed', 'invalid_code', 'origin_not_allowed', 'rate_limited'],
});

export const resendSignUpCode = defineRoute({
  kind: 'open',
  operationId: 'resendSignUpCode',
  method: 'POST',
  path: '/auth/v1/sign-up/resend',
  summary: 'Ponowny kod potwierdzenia konta',
  open: {
    reason: 'Rejestracja: konto jeszcze niepotwierdzone',
    rateLimit: [
      { by: 'ip', max: 20, windowSec: HOUR },
      { by: 'login', max: 5, windowSec: HOUR },
    ],
  },
  body: SignUpResendRequest,
  responses: {
    202: { description: 'Zawsze ta sama odpowiedź', schema: CodeSentResponse },
  },
  errors: ['validation_failed', 'origin_not_allowed', 'rate_limited'],
});

export const login = defineRoute({
  kind: 'open',
  operationId: 'login',
  method: 'POST',
  path: '/auth/v1/login',
  summary: 'Logowanie hasłem: token logowania i kod MFA na kanał konta',
  open: {
    reason: 'Logowanie: access tokenu jeszcze nie ma',
    rateLimit: [
      { by: 'ip', max: 30, windowSec: MIN15 },
      { by: 'login', max: 10, windowSec: MIN15 },
    ],
  },
  body: LoginRequest,
  responses: { 200: { description: 'Kod MFA wysłany', schema: LoginResponse } },
  errors: [
    'validation_failed',
    'invalid_credentials',
    'account_not_confirmed',
    'account_locked',
    'origin_not_allowed',
    'client_not_allowed',
    'rate_limited',
  ],
});

export const loginMfa = defineRoute({
  kind: 'open',
  operationId: 'loginMfa',
  method: 'POST',
  path: '/auth/v1/login/mfa',
  summary: 'Krok MFA: kod (6 cyfr) z tokenem logowania w Authorization: Login <token>',
  open: {
    reason: 'Logowanie: krok MFA z tokenem logowania',
    credential: 'loginToken',
    rateLimit: [
      { by: 'ip', max: 30, windowSec: MIN5 },
      { by: 'loginToken', max: 10, windowSec: MIN5 },
    ],
  },
  body: MfaRequest,
  responses: {
    200: {
      description: 'Access token; refresh token w treści (mobile, tablet) albo w ciasteczku (web)',
      schema: TokenResponse,
      headers: { 'Set-Cookie': SET_COOKIE_RT },
    },
  },
  errors: [
    'validation_failed',
    'invalid_token',
    'invalid_code',
    'account_locked',
    'wrong_client',
    'origin_not_allowed',
    'rate_limited',
  ],
});

export const refreshToken = defineRoute({
  kind: 'open',
  operationId: 'refreshToken',
  method: 'POST',
  path: '/auth/v1/token',
  summary: 'Odświeżenie tokenów refresh tokenem (treść albo ciasteczko web)',
  open: {
    reason: 'Odświeżenie: access token wygasł, poświadczeniem jest refresh token',
    credential: 'refreshToken',
    rateLimit: [{ by: 'ip', max: 120, windowSec: MIN5 }],
  },
  body: TokenRequest,
  responses: {
    200: {
      description: 'Nowe tokeny; sid, sst i auth_time bez zmian',
      schema: TokenResponse,
      headers: { 'Set-Cookie': SET_COOKIE_RT },
    },
  },
  errors: [
    'validation_failed',
    'session_revoked',
    'wrong_client',
    'origin_not_allowed',
    'rate_limited',
  ],
});

export const logout = defineRoute({
  kind: 'open',
  operationId: 'logout',
  method: 'POST',
  path: '/auth/v1/logout',
  summary: 'Wylogowanie: czyści ciasteczko refresh tokenu (sesji w bazie nie ma)',
  open: {
    reason: 'Wylogowanie: działa także po wygaśnięciu access tokenu',
    rateLimit: [{ by: 'ip', max: 60, windowSec: 60 }],
  },
  responses: {
    204: {
      description: 'Wylogowano',
      headers: { 'Set-Cookie': `${REFRESH_COOKIE.name}=; Path=${REFRESH_COOKIE.path}; Max-Age=0` },
    },
  },
  errors: ['origin_not_allowed', 'rate_limited'],
});

export const getMe = defineRoute({
  operationId: 'getMe',
  method: 'GET',
  path: '/auth/v1/me',
  summary: 'Profil zalogowanej osoby i widok startowy',
  responses: { 200: { description: 'Profil', schema: MeResponse } },
  errors: ['invalid_token', 'token_expired'],
});

export const getJwks = defineRoute({
  kind: 'internal',
  operationId: 'getJwks',
  method: 'GET',
  path: '/auth/v1/.well-known/jwks.json',
  summary: 'Klucze publiczne do weryfikacji access tokenów (port jwks, tylko w klastrze)',
  internal: { port: 'jwks', callers: ['*'] },
  responses: {
    200: {
      description: 'JWKS',
      schema: JwksResponse,
      headers: { 'Cache-Control': 'max-age=300' },
    },
  },
  errors: [],
});

export const authRoutes = [
  signUp,
  confirmSignUp,
  resendSignUpCode,
  login,
  loginMfa,
  refreshToken,
  logout,
  getMe,
  getJwks,
] as const;
