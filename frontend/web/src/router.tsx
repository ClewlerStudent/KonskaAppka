import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
  type RouterHistory,
} from '@tanstack/react-router';
import {
  ForgotPasswordScreen,
  BusinessNewScreen,
  NotFoundScreen,
} from './screens/PlaceholderScreens';
import { LoginCodeScreen } from './screens/LoginCodeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpCodeScreen } from './screens/SignUpCodeScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ServicesProvider, type Services } from './services';
import { homePath } from './session/home';

interface RouterContext {
  services: Services;
}

const signedIn = ({ services }: RouterContext) =>
  services.session.getSnapshot().status === 'signedIn';

/** Ekrany logowania i rejestracji: zalogowany trafia na swój ekran startowy. */
function guestOnly({ context }: { context: RouterContext }) {
  if (signedIn(context)) {
    redirect({
      to: homePath(context.services.session.getSnapshot().me),
      replace: true,
      throw: true,
    });
  }
}

function signedInOnly({ context }: { context: RouterContext }) {
  if (!signedIn(context)) redirect({ to: '/login', replace: true, throw: true });
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  // Pierwsze wejście: ciche odświeżenie z ciasteczka i GET /me (raz, potem z pamięci).
  beforeLoad: async ({ context }) => {
    await context.services.session.init();
  },
  component: Outlet,
  notFoundComponent: NotFoundScreen,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    redirect({
      to: signedIn(context) ? homePath(context.services.session.getSnapshot().me) : '/login',
      replace: true,
      throw: true,
    });
  },
});

const routes = [
  indexRoute,
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    beforeLoad: guestOnly,
    component: LoginScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/login/code',
    beforeLoad: guestOnly,
    component: LoginCodeScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-up',
    beforeLoad: guestOnly,
    component: SignUpScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-up/code',
    beforeLoad: guestOnly,
    component: SignUpCodeScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: ForgotPasswordScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/welcome',
    beforeLoad: signedInOnly,
    component: WelcomeScreen,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/business/new',
    beforeLoad: signedInOnly,
    component: BusinessNewScreen,
  }),
] as const;

const routeTree = rootRoute.addChildren(routes);

export function createAppRouter(services: Services, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context: { services },
    ...(history ? { history } : {}),
    defaultPreload: false,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}

export function App({ services, router }: { services: Services; router: AppRouter }) {
  return (
    <ServicesProvider services={services}>
      <RouterProvider router={router} />
    </ServicesProvider>
  );
}
