import { afterEach, describe, expect, it } from 'vitest';
import { readConfig, wwwLinks } from './config';

function setMeta(name: string, content: string) {
  const meta = document.createElement('meta');
  meta.name = name;
  meta.content = content;
  document.head.append(meta);
}

afterEach(() => {
  document.head.innerHTML = '';
});

describe('readConfig', () => {
  it('reads the API and www addresses from meta tags', () => {
    setMeta('eq-api-base', 'https://api.equenor.example/');
    setMeta('eq-www-url', 'https://equenor.example');
    expect(readConfig()).toEqual({
      apiBaseUrl: 'https://api.equenor.example',
      wwwUrl: 'https://equenor.example',
    });
  });

  it('treats empty and unreplaced values as the same origin', () => {
    setMeta('eq-api-base', '');
    setMeta('eq-www-url', '__EQ_WWW_URL__');
    expect(readConfig()).toEqual({ apiBaseUrl: '', wwwUrl: '' });
    document.head.innerHTML = '';
    setMeta('eq-api-base', '%VITE_API_BASE_URL%');
    expect(readConfig().apiBaseUrl).toBe('');
  });

  it('builds footer links to the www site', () => {
    expect(wwwLinks('https://equenor.example')).toEqual({
      home: 'https://equenor.example',
      terms: 'https://equenor.example/regulamin.html',
      privacy: 'https://equenor.example/polityka-prywatnosci.html',
    });
  });
});
