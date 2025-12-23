import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../dialog/dialog'; // 你的 Dialog component

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dialog = inject(MatDialog);

  const phone = localStorage.getItem('phone');
  if (!phone) {
    dialog.open(Dialog, { data: { message: '還想偷渡啊' } });
    dialog.open(Dialog, { data: { message: '沒登入喔' } });
    router.navigate(['/login']);
    return false;
  }

  return true;
};
