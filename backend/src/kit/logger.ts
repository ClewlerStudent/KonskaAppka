import { pino, type DestinationStream, type Logger, type LoggerOptions } from 'pino';

/**
 * Logi JSON (pino). Treści żądań nie logujemy nigdy; redakcja to druga linia obrony,
 * gdyby ktoś zalogował obiekt z hasłem, kodem albo tokenem.
 */
const SECRET_FIELDS = ['password', 'code', 'loginToken', 'accessToken', 'refreshToken'];

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'headers.authorization',
  'headers.cookie',
  ...SECRET_FIELDS,
  ...SECRET_FIELDS.map((field) => `*.${field}`),
];

export interface LoggerConfig {
  readonly service: string;
  readonly level: string;
  /** pino-pretty (zależność dev); bez niej, np. w obrazie, logi zostają w JSON. */
  readonly pretty?: boolean;
}

export type { Logger };

export function createLogger(config: LoggerConfig, destination?: DestinationStream): Logger {
  const options: LoggerOptions = {
    level: config.level,
    base: { service: config.service },
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
  };

  if (destination) return pino(options, destination);

  if (config.pretty && canResolve('pino-pretty')) {
    // Transport pino-pretty nie przyjmuje formatters.level; czytelność ważniejsza w terminalu.
    const { formatters: _formatters, ...rest } = options;
    return pino({
      ...rest,
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,service' },
      },
    });
  }

  const logger = pino(options);
  if (config.pretty) logger.warn('LOG_PRETTY=true, but pino-pretty is not installed; using JSON');
  return logger;
}

function canResolve(specifier: string): boolean {
  try {
    import.meta.resolve(specifier);
    return true;
  } catch {
    return false;
  }
}
