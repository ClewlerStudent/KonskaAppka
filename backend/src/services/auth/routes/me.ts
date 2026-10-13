import { getMe } from '../../../contracts/auth.js';
import { ApiError } from '../../../kit/problem.js';
import type { Service } from '../../../kit/service.js';
import { maskEmail, maskPhone } from '../contact.js';
import type { RouteDeps } from '../deps.js';

export function registerMeRoutes(service: Service, deps: RouteDeps): void {
  const { users } = deps;

  service.route(getMe, async ({ principal }) => {
    const user = await users.getById(principal.userId);
    if (!user || user.deletedAt) throw new ApiError('invalid_token');
    return {
      status: 200,
      body: {
        id: user.id,
        displayName: user.displayName,
        locale: user.locale,
        contact: {
          phoneMasked: user.phoneE164 ? maskPhone(user.phoneE164) : null,
          emailMasked: user.email ? maskEmail(user.email) : null,
        },
        businesses: [...principal.businesses],
        // Bez firm i stajni każdy zaczyna od PanelWitaj; kolejne widoki dojdą addytywnie.
        startView: 'welcome' as const,
      },
    };
  });
}
