import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService, petList } from '../@service/http-client.service';
import { DialogpetComponent } from '../dialogpet/dialogpet.component';

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

  constructor(
    private router: Router,
    private httpClientService: HttpClientService,
  ) {}

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


  search() {
    this.httpClientService.getApi('pet/search').subscribe((res: any) => {
      console.log(res);
      this.element_data = res.petList;
    });
  }

  readonly dialog = inject(MatDialog);

  openDialog(petData: any) {
    console.log('被點擊的資料:', petData); // 可以在 F12 檢查點到了誰

    // 1. 拿掉那個 if (petData == 'data') 的判斷
    // 因為 petData 是物件，不等於字串 'data'

    // 2. 直接打開 Dialog，並且把資料傳進去 (這很重要，不然 Dialog 內容是空的)
    const dialogRef = this.dialog.open(DialogpetComponent, {
      width: '80%',
      height: 'auto',
      data: { inputData: petData }, // 把點到的那隻貓的資料傳給 Dialog7
    });
  }

  // openDialog(petData: any) {
  //   const dialogRef = this.dialog.open(Dialog7Component);
  // }
}
