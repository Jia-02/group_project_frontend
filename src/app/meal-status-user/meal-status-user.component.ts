import { Component } from '@angular/core';
import { DataService, Order } from '../@service/data.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-meal-status-user',
  imports: [FormsModule],
  templateUrl: './meal-status-user.component.html',
  styleUrl: './meal-status-user.component.scss'
})
export class MealStatusUserComponent {

  constructor(private service:DataService){}


  ngOnInit(): void {

  }

  searchOrder(){

  }


}

