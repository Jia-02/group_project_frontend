import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { BasicRes, DataService, WorkTable, WorkTableListRes } from '../data/data.service';
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

  links!: WorkTable[];


  addLink(event: MouseEvent) {

    event.preventDefault();  // 阻止切換
    event.stopPropagation(); // 阻止 mat-tab-group 處理事件

    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "新增" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.name) {
        let url = "http://localhost:8080/workstation/add?workStationName=" + res.name
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "http://localhost:8080/workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          }
        })
      }
    })
  }

  removeLink(id: number) {

    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "刪除" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.flag) {
        let url = "http://localhost:8080/workstation/delete?workStationId=" + id
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "http://localhost:8080/workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          }
        })
      }
    })

  }

  ngOnInit(): void {
    let url = "http://localhost:8080/workstation/list"
    this.service.getApi(url).subscribe((res: WorkTableListRes) => {
      this.links = res.workStationList;
    })
  }







}
