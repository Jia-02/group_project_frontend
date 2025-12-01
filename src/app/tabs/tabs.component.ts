import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { DataService } from '../data/data.service';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-tabs',
  imports: [MatTabsModule, MatButtonModule, RouterLink, RouterOutlet, MatIcon],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

  readonly dialog = inject(MatDialog);


  constructor(private service: DataService) { }

  links: WorkTable[] = [{ id: 1, name: '煎檯' }, { id: 2, name: '飲料檯' }, { id: 3, name: '冷盤工作檯' }];
  order!: Order[];
  meal!: Meal[];
  selectedIndex = 0;

  addLink(event: MouseEvent) {

    event.preventDefault();  // 阻止切換
    event.stopPropagation(); // 阻止 mat-tab-group 處理事件

    const dialgoRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      height: 'auto'
    });
    dialgoRef.afterClosed().subscribe((res: string) => {
      if (res) {
        let url = "http://localhost:8080/workstation/add?workStationName=" + res
        let data
        this.service.postApi(url, data).subscribe((res: any) => {
          console.log(res);
        })
      }
    })

  }

  ngOnInit(): void {
    this.meal = [{ id: 1, name: "茶葉蛋", price: 10, count: 2 }, { id: 2, name: "義大利麵", price: 150, count: 1 }];
    let price = 0;
    for (let i = 0; i < this.meal.length; i++) {
      price += this.meal[i].price * this.meal[i].count;
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
