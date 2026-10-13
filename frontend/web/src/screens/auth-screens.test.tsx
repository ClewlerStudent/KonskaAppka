import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeApi, fail, ok } from '../test/fake-api';
import { renderApp } from '../test/render-app';

const passwordInput = () => screen.getByLabelText('Hasło', { selector: 'input' });

async function openLogin(options: Parameters<typeof renderApp>[1] = {}) {
  const app = renderApp('/login', options);
  await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
  return app;
}

async function submitLogin(app: ReturnType<typeof renderApp>, phone = '602 000 145') {
  await app.user.type(screen.getByLabelText('Numer telefonu'), phone);
  await app.user.type(passwordInput(), 'Dobre-haslo-123');
  await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
}

describe('LoginScreen', () => {
  it('shows the EQUENOR wordmark with the tagline and footer links to www', async () => {
    await openLogin();
    expect(screen.getByText('EQUENOR')).toHaveClass('eq-wordmark');
    expect(screen.getByText('Equestrian Management, Refined')).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('link', { name: 'Regulamin' })).toHaveAttribute(
      'href',
      'https://equenor.example/regulamin.html',
    );
    expect(document.title).toBe('Logowanie · EQUENOR');
  });

  it('switches between phone and e-mail', async () => {
    const { user } = await openLogin();
    const group = screen.getByRole('group', { name: 'Zaloguj się przez' });
    expect(within(group).getByRole('button', { name: 'Telefon' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Numer telefonu')).toHaveFocus();
    await user.click(within(group).getByRole('button', { name: 'E-mail' }));
    expect(within(group).getByRole('button', { name: 'E-mail' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByLabelText('Numer telefonu')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Adres e-mail')).toHaveAttribute('type', 'email');
  });

  it('sends the phone as E.164 and opens the code step', async () => {
    const app = await openLogin();
    await submitLogin(app);
    expect(app.api.login).toHaveBeenCalledWith('+48602000145', 'Dobre-haslo-123');
    await screen.findByRole('heading', { name: 'Wpisz kod z SMS' });
    expect(app.pathname()).toBe('/login/code');
    expect(screen.getByText('+48 602 *** 145')).toBeInTheDocument();
  });

  it('shows / hides the password', async () => {
    const { user } = await openLogin();
    expect(passwordInput()).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Pokaż hasło' }));
    expect(passwordInput()).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ukryj hasło' }));
    expect(passwordInput()).toHaveAttribute('type', 'password');
  });

  it('validates the form before calling the API', async () => {
    const app = await openLogin();
    await app.user.type(screen.getByLabelText('Numer telefonu'), '602 000');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Wpisz 9 cyfr numeru telefonu.');
    expect(screen.getByLabelText('Numer telefonu')).toHaveAttribute('aria-invalid', 'true');
    await app.user.type(screen.getByLabelText('Numer telefonu'), ' 145');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Wpisz hasło.');
    expect(passwordInput()).toHaveFocus();
    expect(app.api.login).not.toHaveBeenCalled();
  });

  it.each([
    ['invalid_credentials', 401, 'Nieprawidłowy numer, e-mail lub hasło.'],
    [
      'account_locked',
      403,
      'Konto zablokowane po zbyt wielu błędnych kodach. Użyj „Nie pamiętam hasła”.',
    ],
    ['rate_limited', 429, 'Za dużo prób. Spróbuj ponownie za chwilę.'],
    ['internal_error', 500, 'Coś poszło nie tak. Spróbuj ponownie.'],
    ['network_error', 0, 'Brak połączenia z serwerem. Spróbuj ponownie.'],
  ] as const)('maps %s to a message', async (code, status, message) => {
    const api = createFakeApi();
    api.login.mockResolvedValue(fail(status, code));
    const app = await openLogin({ api });
    await submitLogin(app);
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(app.pathname()).toBe('/login');
  });

  it('clears the password after invalid credentials', async () => {
    const api = createFakeApi();
    api.login.mockResolvedValue(fail(401, 'invalid_credentials'));
    const app = await openLogin({ api });
    await submitLogin(app);
    await screen.findByRole('alert');
    expect(passwordInput()).toHaveValue('');
    expect(passwordInput()).toHaveFocus();
  });

  it('an unconfirmed account gets a new code and goes to the confirmation', async () => {
    const api = createFakeApi();
    api.login.mockResolvedValue(fail(409, 'account_not_confirmed'));
    const app = await openLogin({ api });
    await submitLogin(app);
    await screen.findByRole('heading', { name: 'Potwierdź konto' });
    expect(api.resendSignUpCode).toHaveBeenCalledWith('+48602000145');
    expect(app.pathname()).toBe('/sign-up/code');
  });
});

describe('LoginCodeScreen', () => {
  async function openCode() {
    const app = await openLogin();
    await submitLogin(app);
    await screen.findByRole('heading', { name: 'Wpisz kod z SMS' });
    return app;
  }

  it('logs in with the code and opens PanelWitaj', async () => {
    const app = await openCode();
    expect(screen.getByRole('link', { name: 'Zmień numer' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cyfra 1 z 6')).toHaveFocus();
    await app.user.keyboard('482913');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
    expect(app.api.loginMfa).toHaveBeenCalledWith('lt-1', '482913');
    expect(app.pathname()).toBe('/welcome');
    expect(screen.getByText('Zalogowano:')).toHaveTextContent('Zalogowano: +48 602 *** 145');
  });

  it('asks for all digits before calling the API', async () => {
    const app = await openCode();
    await app.user.keyboard('48');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Wpisz wszystkie cyfry kodu.');
    expect(app.api.loginMfa).not.toHaveBeenCalled();
  });

  it('a wrong code shows a message and clears the cells', async () => {
    const api = createFakeApi();
    api.loginMfa.mockResolvedValue(fail(401, 'invalid_code'));
    const app = await openLogin({ api });
    await submitLogin(app);
    await screen.findByRole('heading', { name: 'Wpisz kod z SMS' });
    await app.user.keyboard('000000');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nieprawidłowy kod. Spróbuj jeszcze raz.',
    );
    expect(screen.getByLabelText('Cyfra 1 z 6')).toHaveValue('');
    expect(screen.getByLabelText('Cyfra 1 z 6')).toHaveFocus();
  });

  it('an expired login token sends back to logging in', async () => {
    const api = createFakeApi();
    api.loginMfa.mockResolvedValue(fail(401, 'invalid_token'));
    const app = await openLogin({ api });
    await submitLogin(app);
    await screen.findByRole('heading', { name: 'Wpisz kod z SMS' });
    await app.user.keyboard('482913');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Kod wygasł. Zaloguj się ponownie.');
    await app.user.click(within(alert).getByRole('link', { name: 'Zaloguj się ponownie' }));
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(screen.getByLabelText('Numer telefonu')).toHaveValue('602 000 145');
    expect(passwordInput()).toHaveFocus();
  });

  it('e-mail login with an SMS channel offers „Zmień e-mail”', async () => {
    const app = await openLogin();
    await app.user.click(screen.getByRole('button', { name: 'E-mail' }));
    await app.user.type(screen.getByLabelText('Adres e-mail'), 'damian@stajnielipowe.pl');
    await app.user.type(passwordInput(), 'Dobre-haslo-123');
    await app.user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    await screen.findByRole('heading', { name: 'Wpisz kod z SMS' });
    expect(screen.getByRole('group', { name: 'Kod z SMS' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zmień e-mail' })).toBeInTheDocument();
  });
});

describe('sign-up', () => {
  it('creates an account, confirms it with 8 digits and returns to login', async () => {
    const app = renderApp('/sign-up');
    await screen.findByRole('heading', { name: 'Załóż konto' });
    await app.user.click(screen.getByRole('button', { name: 'E-mail' }));
    await app.user.type(screen.getByLabelText('Adres e-mail'), 'jan@stajniabrzozowa.pl');
    await app.user.type(passwordInput(), 'krotkie');
    await app.user.type(screen.getByLabelText('Imię i nazwisko'), '  Jan Brzoza ');
    await app.user.click(screen.getByRole('button', { name: 'Українська' }));
    await app.user.click(screen.getByRole('button', { name: 'Załóż konto' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Hasło musi mieć co najmniej 10 znaków.');
    expect(app.api.signUp).not.toHaveBeenCalled();

    await app.user.type(passwordInput(), '-i-dluzsze');
    await app.user.click(screen.getByRole('button', { name: 'Załóż konto' }));
    await screen.findByRole('heading', { name: 'Potwierdź konto' });
    expect(app.api.signUp).toHaveBeenCalledWith({
      login: 'jan@stajniabrzozowa.pl',
      password: 'krotkie-i-dluzsze',
      displayName: 'Jan Brzoza',
      locale: 'uk',
    });
    expect(screen.getByText('j•••@stajniabrzozowa.pl')).toBeInTheDocument();

    await app.user.keyboard('48291375');
    await app.user.click(screen.getByRole('button', { name: 'Potwierdź' }));
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(app.api.confirmSignUp).toHaveBeenCalledWith('jan@stajniabrzozowa.pl', '48291375');
    expect(screen.getByRole('status')).toHaveTextContent('Konto potwierdzone. Zaloguj się.');
    expect(screen.getByLabelText('Adres e-mail')).toHaveValue('jan@stajniabrzozowa.pl');
    expect(passwordInput()).toHaveFocus();
  });

  it('a wrong confirmation code shows „Nieprawidłowy kod.”', async () => {
    const api = createFakeApi();
    api.confirmSignUp.mockResolvedValue(fail(401, 'invalid_code'));
    const app = renderApp('/sign-up', { api });
    await screen.findByRole('heading', { name: 'Załóż konto' });
    await app.user.type(screen.getByLabelText('Numer telefonu'), '602000145');
    await app.user.type(passwordInput(), 'Dobre-haslo-123');
    await app.user.type(screen.getByLabelText('Imię i nazwisko'), 'Damian');
    await app.user.click(screen.getByRole('button', { name: 'Załóż konto' }));
    await screen.findByRole('heading', { name: 'Potwierdź konto' });
    await app.user.keyboard('11111111');
    await app.user.click(screen.getByRole('button', { name: 'Potwierdź' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy kod.');
    expect(screen.getByLabelText('Cyfra 8 z 8')).toHaveValue('');
  });

  it('server-side weak_password is shown at the password field', async () => {
    const api = createFakeApi();
    api.signUp.mockResolvedValue(fail(422, 'weak_password'));
    const app = renderApp('/sign-up', { api });
    await screen.findByRole('heading', { name: 'Załóż konto' });
    await app.user.type(screen.getByLabelText('Numer telefonu'), '602000145');
    await app.user.type(passwordInput(), 'aaaaaaaaaa');
    await app.user.type(screen.getByLabelText('Imię i nazwisko'), 'Damian');
    await app.user.click(screen.getByRole('button', { name: 'Załóż konto' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Hasło musi mieć co najmniej 10 znaków.',
    );
    expect(passwordInput()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('WelcomeScreen and routing', () => {
  it('silent refresh at start opens PanelWitaj; logout returns to login', async () => {
    const app = renderApp('/', { signedIn: true });
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
    expect(app.pathname()).toBe('/welcome');
    expect(screen.getByRole('heading', { name: 'Witaj w EQUENOR, Damian' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Załóż konto firmy' })).toHaveAttribute(
      'href',
      '/business/new',
    );
    await app.user.click(screen.getByRole('button', { name: 'Wyloguj' }));
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(app.api.logout).toHaveBeenCalledTimes(1);
    expect(app.pathname()).toBe('/login');
  });

  it('greets by first name and shows the e-mail when the account has no phone', async () => {
    const api = createFakeApi();
    api.getMe.mockResolvedValue(
      ok({
        id: '0199c6a0-0000-7000-8000-000000000004',
        displayName: ' Marta  Kowalska-Wiśniewska ',
        locale: 'pl',
        contact: { phoneMasked: null, emailMasked: 'm•••@stajnielipowe.pl' },
        businesses: [],
        startView: 'welcome',
      }),
    );
    renderApp('/welcome', { api, signedIn: true });
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Marta' });
    expect(screen.getByText('Zalogowano:')).toHaveTextContent('Zalogowano: m•••@stajnielipowe.pl');
  });

  it.each(['/welcome', '/business/new'])('%s without a session goes to /login', async (path) => {
    const app = renderApp(path);
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(app.pathname()).toBe('/login');
  });

  it.each(['/login', '/sign-up', '/'])('%s with a session goes to /welcome', async (path) => {
    const app = renderApp(path, { signedIn: true });
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
    expect(app.pathname()).toBe('/welcome');
  });

  it('code screens without a pending step go back to the forms', async () => {
    const app = renderApp('/login/code');
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(app.pathname()).toBe('/login');

    const signUp = renderApp('/sign-up/code');
    await waitFor(() => expect(signUp.pathname()).toBe('/sign-up'));
  });

  it('a session revoked while on PanelWitaj returns to login', async () => {
    const app = renderApp('/welcome', { signedIn: true });
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
    app.api.getMe.mockResolvedValue(fail(401, 'invalid_token'));
    await app.services.session.authorized((token) => app.api.getMe(token));
    await screen.findByRole('heading', { name: 'Zaloguj się do panelu stajni' });
    expect(app.pathname()).toBe('/login');
  });

  it('unknown paths show a not-found card', async () => {
    renderApp('/nie-ma');
    await screen.findByRole('heading', { name: 'Nie ma takiej strony' });
    expect(screen.getByRole('link', { name: 'Przejdź do panelu' })).toHaveAttribute('href', '/');
  });

  it('placeholders: forgot password and the business sign-up', async () => {
    renderApp('/forgot-password');
    await screen.findByRole('heading', { name: 'Nie pamiętam hasła' });
    expect(screen.getByRole('link', { name: 'Wróć do logowania' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('„Załóż konto firmy” opens the placeholder with a way back', async () => {
    const app = renderApp('/welcome', { signedIn: true });
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
    await app.user.click(screen.getByRole('link', { name: 'Załóż konto firmy' }));
    await screen.findByText('Ten krok jest w przygotowaniu.');
    expect(screen.getByRole('button', { name: 'Wyloguj' })).toBeInTheDocument();
    await app.user.click(screen.getByRole('link', { name: '← Wróć' }));
    await screen.findByRole('heading', { name: 'Witaj w EQUENOR, Damian' });
  });
});
