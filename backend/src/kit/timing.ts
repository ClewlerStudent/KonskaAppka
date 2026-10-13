export type Sleep = (ms: number) => Promise<void>;

export const sleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wykonuje `work` i kończy nie wcześniej niż `minMs` od startu, także gdy `work` rzuci.
 * Wyrównuje czas odpowiedzi, które nie mogą zdradzać, czy konto istnieje. Mierzy zegarem
 * monotonicznym procesu, nie wstrzykiwanym (ten służy do wygasania).
 */
export async function atLeast<T>(
  minMs: number,
  work: () => Promise<T>,
  wait: Sleep = sleep,
): Promise<T> {
  const start = performance.now();
  try {
    return await work();
  } finally {
    const left = minMs - (performance.now() - start);
    if (left > 0) await wait(left);
  }
}
