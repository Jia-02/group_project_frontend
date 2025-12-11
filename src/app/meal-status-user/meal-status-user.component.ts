import { Component } from '@angular/core';
import { DataService, MealStatus, MealStatusRes, Order } from '../@service/data.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-meal-status-user',
  imports: [FormsModule],
  templateUrl: './meal-status-user.component.html',
  styleUrl: './meal-status-user.component.scss'
})
export class MealStatusUserComponent {

  constructor(private service:DataService,private activatedRoute:ActivatedRoute){}
  orderId!:any;
  mealStatus!:MealStatus;

  ngOnInit(): void {
    console.log(this.activatedRoute.snapshot.queryParamMap.get('orderId'))
    this.orderId = this.activatedRoute.snapshot.queryParamMap.get('orderId')
    let url = "http://localhost:8080/meal/status?orderId=" + this.orderId;
    this.service.getApi(url).subscribe((res:MealStatusRes)=>{
      this.mealStatus = res.mealStatus;
    })

  }

}

