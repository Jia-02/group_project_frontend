import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService, petList } from '../@service/http-client.service';

@Component({
  selector: 'app-pet',
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './pet.component.html',
  styleUrl: './pet.component.scss'
})
export class PetComponent {
  element_data_basic: petList[] = []; //這個拿來當作放完整資料的，不會再被編輯的
  element_data: petList[] = []; //這個是拿來顯示用的
  id!: number;
  select!: number;
  selectList!: [];
  inputData!: any;

  isComplete: boolean = true;

  ngOnInit() {
    this.httpClientService.getApi('pet/search').subscribe((res: any) => {
      console.log(res);
      this.element_data = res.petList;
      this.element_data_basic = res.petList;
    });
  }
  //回去看看如何將api送來的資料再分送給前段畫面，可參考天氣api

  constructor(private router: Router, private httpClientService: HttpClientService) {}

  changeInput(event: Event) {
    let tidyData: petList[] = [];
    this.element_data_basic.forEach((res) => {
      if (res.catName.indexOf((event.target as HTMLInputElement).value) != -1) {
        tidyData.push(res);
      }
    });
    console.log((event.target as HTMLInputElement).value);
    this.element_data = tidyData;
  }

  go() {
    this.router.navigate(['/home']);
  }

  search() {
    this.httpClientService.getApi('pet/search').subscribe((res: any) => {
      console.log(res);
      this.element_data = res.petList;
    });
  }

  openInfo(data: any) {
    // 如果這個屬性還不存在，它會是 undefined (假)，取反變 true
    // 如果已經是 true，取反變 false
    data.isExpanded = !data.isExpanded;
  }
}
