import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userData = localStorage.getItem('userLoggedIn');

    if (!userData) {
        router.navigate(['/login']);
        return false;
    }

    try {
        JSON.parse(userData);
        return true;
    } catch {
        localStorage.removeItem('userLoggedIn');
        router.navigate(['/login']);
        return false;
    }
};