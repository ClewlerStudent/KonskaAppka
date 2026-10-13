import { useEffect, useState } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/**
 * Sekundy do końca odliczania od zamontowania (zegar ścienny, więc działa też po uśpieniu karty).
 * Nowe odliczanie: rodzic montuje komponent od nowa (zmiana `key`).
 */
export function useCountdown(seconds: number): number {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const endsAt = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [seconds]);
  return remaining;
}

export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
