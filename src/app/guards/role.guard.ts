import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return () => {
        const router = inject(Router);
        const userData = localStorage.getItem('userLoggedIn');

        if (!userData) {
            router.navigate(['/login']);
            return false;
        }

        try {
            const user = JSON.parse(userData);
            if (allowedRoles.includes(user.role)) {
                return true;
            }
            // Redirect to their own dashboard rather than login
            router.navigate(['/dashboard']);
            return false;
        } catch {
            localStorage.removeItem('userLoggedIn');
            router.navigate(['/login']);
            return false;
        }
    };
};