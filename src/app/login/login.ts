import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../dialog/dialog';
import { BasicRes, AccountLoginReq, AccountRegisterReq, Http } from '../@service/http';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-login',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule, MatIcon],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  flipped = false;
  loginAccount = '';
  loginPassword = '';


  registerAccount = '';
  registerPassword = '';
  registerName = '';
  registerPhone = '';
  showLoginPassword = false;
  showRegisterPassword = false;

  constructor(private router: Router, private http: Http, private dialog: MatDialog) { }

  flipCard() {
    this.flipped = !this.flipped;
    this.registerAccount = '';
    this.registerPassword = '';
    this.registerName = '';
    this.registerPhone = '';

  }

  // 登入
  onLogin() {
    const payload: AccountLoginReq = {
      userName: this.loginAccount,
      password: this.loginPassword
    };

    this.http.login(payload).subscribe({
      next: (res) => {
        if (res.code === 200) {

          // 直接從 res 拿，不用 data
          const userId = res.id!;
          const name = res.name ?? '';
          const phone = res.phone ?? '';

          // 存到 localStorage
          localStorage.setItem('userId', userId.toString());
          localStorage.setItem('name', name);
          localStorage.setItem('phone', phone);

          this.openDialog('登入成功');
          this.router.navigateByUrl('/front');

        } else {
          this.openDialog('登入失敗: ' + res.message);
        }
      },
      error: (err) => {
        console.error('login error:', err);
        if (err.error && err.error.message) {
          this.openDialog(err.error.message);
        } else if (typeof err.error === 'string') {
          this.openDialog(err.error);
        } else {
          this.openDialog('系統錯誤，請稍後再試');
        }
      }
    });
  }



  // 註冊
  onRegister() {
    // 基本欄位檢查
    if (!this.registerAccount.trim() || !this.registerPassword.trim() ||
      !this.registerName.trim() || !this.registerPhone.trim()) {
      this.openDialog('請填寫所有欄位！');
      return;
    }

    // 電話格式檢查 09開頭共10碼
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(this.registerPhone)) {
      this.openDialog('電話號碼格式錯誤（需09開頭共10碼）');
      return;
    }

    const payload: AccountRegisterReq = {
      userName: this.registerAccount.trim(),
      password: this.registerPassword,
      name: this.registerName.trim(),
      phone: this.registerPhone.trim()
    };

    this.http.register(payload).subscribe({
      next: (res: BasicRes) => {
        if (res.code === 200) {
          this.openDialog('註冊成功！');
          this.flipCard(); // 註冊成功翻回登入面
          // 清空欄位
          this.registerAccount = '';
          this.registerPassword = '';
          this.registerName = '';
          this.registerPhone = '';
        } else {
          this.openDialog('註冊失敗: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.openDialog('系統錯誤，請稍後再試');
      }
    });
  }

  openDialog(message: string): void {
    this.dialog.open(Dialog, {
      data: { title: "提醒", message } // 將訊息傳遞給 DialogComponent
    });
  }






}
