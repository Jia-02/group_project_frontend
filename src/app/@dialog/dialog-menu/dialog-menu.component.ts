import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { categoryDto, productDto, productListResponse } from '../../@interface/interface';
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
    private httpClientService: HttpClientService
  ) { }

  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  productDto: productDto = {
    productId: 0,
    productName: '',
    productPrice: 0,
    productActive: true, // 預設為啟用
    productDescription: '',
    imageUrl: '',
    productNote: '',
    categoryId: 0
  };

  // 儲存計算出的下一個產品 ID (預設從 1 開始)
  nextProductId: number = 1;
  // 標記 ID 是否正在計算中。初始為 true
  isIdCalculating: boolean = true;
  categoryPathMap: { [key: string]: string } = {
    '套餐': '/set/',
    '飲品': '/drink/',
    '義大利麵': '/pasta/',
    '披薩': '/pizza/',
    '火鍋': '/hotpot/',
  };

  selectedFile: File | null = null; // 儲存使用者選中的檔案

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    if (this.data && this.data.categoryType) {
      this.categoryDto.categoryType = this.data.categoryType;
      this.categoryDto.categoryId = this.data.categoryId;

    }
  }

  countNextProductId(): void {
    const targetCategoryId = Number(this.categoryDto.categoryId);
    const apiUrl = `http://localhost:8080/product/list?categoryId=${targetCategoryId}`;

    this.httpClientService.getApi(apiUrl)
      .subscribe({
        next: (res) => {
          const response = res as productListResponse;
          if (response && response.productList && response.productList.length > 0) {

            // 要先抓API商品的陣列中的商品內容 你必須要從商品的內容中抓到id最後面的那個 然後在+1

            // 【修正點 3】過濾時兩邊都轉成 Number，確保過濾成功
            const productsInCurrentCategory = response.productList.filter(
              p => Number(p.categoryId) === targetCategoryId
            );

            console.log(productsInCurrentCategory);

            if (productsInCurrentCategory.length > 0) {
              const maxId = productsInCurrentCategory.reduce((max, p) =>
                p.productId > max ? p.productId : max, 0);
              this.nextProductId = maxId + 1;
            } else {
              this.nextProductId = 1;
            }
          } else {
            this.nextProductId = 1;
          }

          this.isIdCalculating = false;
          this.addProduct();
          console.log(`類別 ${targetCategoryId} 計算完成，下一個 ID 為: ${this.nextProductId}`);
        },
        error: (err) => {
          console.error('Failed to retrieve product list:', err);
          this.isIdCalculating = false; // 發生錯誤也要解鎖
        }
      });
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    // 如果 API 還沒回傳，禁止送出表單
    // if (this.isIdCalculating) {
    //   alert('系統正在計算產品編號，請稍候...');
    //   return;
    // }

    // 檢查必填欄位
    if (!this.selectedFile || !this.productDto.productName || !this.productDto.productPrice) {
      return;
    }

    this.countNextProductId();

  }

  addProduct() {
    // 如果 ID 仍為 0 或更小，強制設為 1
    if (this.nextProductId <= 0) {
      this.nextProductId = 1;
    }

    let imagePathString: string = '';
    const fileName = this.selectedFile?.name; // 取得檔案名稱

    // 將檔案名與 Angular 專案的靜態資源路徑
    const categoryType = this.categoryDto.categoryType;
    const imagePrefix = this.categoryPathMap[categoryType] || '/default/'; // 如果找不到，使用 /default/ 作為安全預設值
    imagePathString = imagePrefix + fileName;
    console.log('即將送出的 ID:', this.nextProductId);
    // console.log('給後端的路徑字串:', imagePathString);

    let finalProductDto = {
      productId: this.nextProductId,
      productName: this.productDto.productName,
      productPrice: this.productDto.productPrice,
      productActive: this.productDto.productActive,
      productDescription: this.productDto.productDescription,
      productNote: this.productDto.productNote,
      imageUrl: imagePathString,
      categoryId: this.categoryDto.categoryId
    };

    console.log(finalProductDto);

    this.httpClientService.postApi('http://localhost:8080/product/add', finalProductDto)
      .subscribe((res) => {
        console.log(res);
        this.dialogRef.close();
      });
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

// 輸入完內容 > 確定 > 東西丟給api叫他產生商品id > 等待api回應你商品id > 取得商品id之後去新增商品

