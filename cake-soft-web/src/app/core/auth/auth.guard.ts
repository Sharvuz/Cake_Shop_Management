import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {

    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles) {
      const userRole = authService.getRole();
      if (!userRole || !requiredRoles.includes(userRole)) {
        router.navigate(['/']);
        return false;
      }
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
