import { productListRes } from './../../@interface/interface';
import { DataService } from './../../@service/data.service';
import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { categoryDto, productList } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-menu',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule
  ],
  templateUrl: './dialog-menu.component.html',
  styleUrl: './dialog-menu.component.scss'
})
export class DialogMenuComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService) { }

  selectedFile: File | null = null; // 儲存使用者選中的檔案
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  productList: productList = {
    productId: 0,
    productName: '',
    productPrice: 0,
    productActive: true, // 預設為啟用
    productDescription: '',
    imageUrl: '',
    productNote: '',
    categoryId: 0
  };

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  // 要先抓API商品的陣列中的商品內容 你必須要從商品的內容中抓到id最後面的那個 然後在+1

  ngOnInit(): void {
    //  從service抓分類的id
    this.productList.categoryId = this.data.categoryId;
    this.categoryDto.categoryType = this.data.categoryType;
    this.searchProduct(this.productList.categoryId);
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    this.countNextProductId();
    this.productList;
    console.log(this.productList);

    // 檢查必填欄位
    if (!this.selectedFile || !this.productList.productName || !this.productList.productPrice || !this.productList.productDescription) {
      alert('必填沒填');
      return;
    }

    // 拼湊圖片路字串，組合結果: "/drink/drink (1).jpg"
    const folderMap: { [key: string]: string } = {
      '套餐': 'set',
      '飲料': 'drink',
      '義大利麵': 'pasta',
      '點心': 'snack',
      '披薩': 'pizza',
      '火鍋': 'hotpot',
      '炸物': 'fried'
    };

    const currentType = this.categoryDto.categoryType;
    const folderName = folderMap[currentType];
    this.productList.imageUrl = `/${folderName}/${this.selectedFile.name}`;

    this.httpClientService.postApi('http://localhost:8080/product/add', this.productList)
      .subscribe((res: any) => {
        console.log(res);
        if (res.code == 200) {
          this.dialogRef.close(true);
        }
      });
  }


  searchProduct(categoryId: number) {
    const apiUrl = `http://localhost:8080/product/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl).subscribe((res: any) => {
      if (res.code == 200) {
        this.dataService.productListRes.productList = res.productList;
        console.log('DataService 更新完成，目前數量:', this.dataService.productListRes.productList.length);
      }
    })
  }

  countNextProductId() {
    const allProducts = this.dataService.productListRes.productList;

    let maxId = 0;
    // 迴圈該分類下產品ID的最大值加1
    for (let product of allProducts) {
      if (product.productId && product.productId > maxId) {
        maxId = product.productId;
      }
    }
    this.productList.productId = maxId + 1;
    console.log('算出來的新 ID 是:', this.productList.productId);
  }


  // 處理檔案選取事件
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }
}
