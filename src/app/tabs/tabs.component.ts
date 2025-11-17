import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-tabs',
  imports: [MatTabsModule, MatButtonModule, RouterLink, RouterOutlet],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

  links: WorkTable[] = [{ id: 1, name: '煎檯' }, { id: 2, name: '飲料檯' }, { id: 3, name: '冷盤工作檯' }];
  order!: Order[];
  meal!: Meal[];

  addLink() {
    this.links.push();
  }

  ngOnInit(): void {
    this.meal = [{ id: 1, name: "茶葉蛋", price: 10, count: 2}, { id: 2, name: "義大利麵", price: 150,count:1 }];
    let price = 0;
    for (let i = 0; i < this.meal.length; i++) {
      price += this.meal[i].price*this.meal[i].count;
    }
    this.order = [{ id: 1, workTableId: 1, tableId: 1, price: price, takeaway: false, pay: false, meal: this.meal },
    { id: 3, workTableId: 1, tableId: 0, price: price, takeaway: true, pay: false, meal: this.meal },
    { id: 6, workTableId: 1, tableId: 0, price: price, takeaway: true, pay: false, meal: this.meal },
    { id: 4, workTableId: 1, tableId: 4, price: price, takeaway: false, pay: false, meal: this.meal },
    { id: 5, workTableId: 1, tableId: 5, price: price, takeaway: false, pay: false, meal: this.meal },
    { id: 2, workTableId: 2, tableId: 0, price: price, takeaway: true, pay: true, meal: this.meal }];

  }

}

interface WorkTable {
  id: number;
  name: string;
}

interface Order {
  id: number;
  workTableId: number;
  tableId: number;
  price: number;
  takeaway: boolean;
  pay: boolean;
  meal: Meal[];
}

interface Meal {
  id: number;
  name: string;
  price: number;
  count: number;
}
