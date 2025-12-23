import { Component } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './@component/header/header.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingServiceService } from './@service/loading-service.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GroupProject';

  showHeader = true;

  constructor(private router: Router,
    private loadingServiceService: LoadingServiceService) {
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (event['url'].match('meal/status/user') ||
          event['url'].match('inner-start-page') ||
          event['url'].match('pet') ||
          event['url'].match('/non-inner-start-page') ||
          event['url'].match('/customer-information') ||
          event['url'].match('front') ||
          event['url'].match('todays/orders') ||
          event['url'].match('historyorders') ||
          event['url'].match('login') ||
          event['url'].match('map') ||
          event['url'].match('analyze') ||
          event['url'] == '/menu') {
          let header = document.getElementById('myHeader') as HTMLHeadElement
          header.style.display = "none";
          this.showHeader = false;
        } else {
          let header = document.getElementById('myHeader') as HTMLHeadElement
          header.style.display = "block";
          this.showHeader = true;
        }
      }
    });
  }

  loading$!: boolean;
  ngOnInit(): void {
    this.loadingServiceService.loading$.subscribe((res) => {
      console.log(res);

      this.loading$ = res;
    });
  }


}

// angular.json設定，75行追加
// "options": {
//   "host": "0.0.0.0",
//   "disableHostCheck": true
// }
