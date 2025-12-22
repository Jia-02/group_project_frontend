import { Component } from '@angular/core';
import { DataService, MealStatus, MealStatusRes } from '../@service/data.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-meal-status-user',
  imports: [FormsModule],
  templateUrl: './meal-status-user.component.html',
  styleUrl: './meal-status-user.component.scss'
})
export class MealStatusUserComponent {

  constructor(private service: DataService, private activatedRoute: ActivatedRoute, private router: Router) { }
  orderId!: any;
  mealStatus!: MealStatus;
  timerId!: any;
  message!: string;

  ngOnInit(): void {
    console.log(this.activatedRoute.snapshot.queryParamMap.get('orderId'))
    this.orderId = this.activatedRoute.snapshot.queryParamMap.get('orderId')

    if (this.orderId) {
      let url = "meal/status?orderId=" + this.orderId;
      this.service.getApi(url).subscribe((res: MealStatusRes) => {
        this.mealStatus = {
          mealStatusId: res.mealStatus.mealStatusId,paid:res.order.paid
          , mealStatus: res.mealStatus.mealStatus, estimatedTime: res.mealStatus.estimatedTime,
          finishTime: res.mealStatus.finishTime, ordersId: res.mealStatus.ordersId,
          order: res.order, orderDetailsList: res.orderDetailsList
        }
        console.log(this.mealStatus)
      })
    }

    if (this.orderId) {
      this.timerId = setInterval(() => {
        this.orderId = this.activatedRoute.snapshot.queryParamMap.get('orderId')
        let url = "meal/status?orderId=" + this.orderId;
        this.service.getApi(url).subscribe((res: MealStatusRes) => {
          this.mealStatus = {
            mealStatusId: res.mealStatus.mealStatusId,paid:res.order.paid
            , mealStatus: res.mealStatus.mealStatus, estimatedTime: res.mealStatus.estimatedTime,
            finishTime: res.mealStatus.finishTime, ordersId: res.mealStatus.ordersId,
            order: res.order, orderDetailsList: res.orderDetailsList
          }
          console.log(this.mealStatus)
        })
      }, 1000); // 每1秒執行一次
    }
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  search() {
    let url = "meal/status?orderId=" + this.orderId;
    this.service.getApi(url).subscribe((res: MealStatusRes) => {
      if (res.code == 200) {
        url = '/meal/status/user?orderId=' + this.orderId;
        this.router.navigateByUrl(url).then(() => {
          window.location.reload();
        });
      }
    })
  }

}

