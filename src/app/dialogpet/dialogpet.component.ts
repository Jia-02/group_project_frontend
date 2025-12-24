import { Component,inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { petList } from '../@service/http-client.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dialogpet',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatDialogModule,
    RouterOutlet,
  ],
  templateUrl: './dialogpet.component.html',
  styleUrl: './dialogpet.component.scss'
})
export class DialogpetComponent {

element_data: petList[] = [];
  id!: number;
  name!: any;
  age!: number;
  info!: string;
  img!: string | ArrayBuffer | null;
  status!: boolean;
  file!: string;
  petData!: any;

  data = inject(MAT_DIALOG_DATA);

  ngOnInit(): void {
    // this.http.getApi('pet/search').subscribe((res:any) => console.log(res));
    //這裡要記得帶入所點的圖片id，才能讓dialog顯示原本的內容並讓使用者修改
    console.log(this.data.inputData);
    // this.element_data = this.data.petData;
    console.log(this.data.inputData.catName);
    // this.element_data = this.data.petData;
    this.name = this.data.inputData.catName;
    this.age = this.data.inputData.age;
    this.img = this.data.inputData.catImg;
    this.info = this.data.inputData.catInfo;
    this.status = this.data.inputData.catStatus; //目前用不到
    this.id = this.data.inputData.catId; //目前用不到
    // this.fileName = this.data.inputData.catImg;
  }

}

