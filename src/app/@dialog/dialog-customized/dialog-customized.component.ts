import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { customizedOption } from '../../@interface/interface';
import { DataService } from '../../@service/data.service';
import { HttpClientService } from '../../@service/http-client.service';

@Component({
  selector: 'app-dialog-customized',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './dialog-customized.component.html',
  styleUrl: './dialog-customized.component.scss'
})
export class DialogCustomizedComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService
  ) { }

  readonly dialogRef = inject(MatDialogRef<DialogCustomizedComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);


  // 初始化資料模型
  customizedData: customizedOption = {
    optionId: 0,
    optionName: '',
    maxSelect: 1,
    categoryId: 0,
    optionDetail: [
      { option: '', addPrice: 0 }
    ]
  };
  currentType: 'S' | 'M' = 'S'; // 顯示目前的類型 (S: 單選, M: 複選)
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.customizedData.categoryId = this.data.categoryId;

    // 檢查是否為編輯模式
    if (this.data.isEditMode && this.data.targetOption) {
      this.isEditMode = true;

      // 使用原生深拷貝
      this.customizedData = structuredClone(this.data.targetOption);
      this.customizedData.categoryId = this.data.categoryId;

      // 假設 maxSelect > 1 就是複選，否則為單選
      if (this.customizedData.maxSelect > 1) {
        this.currentType = 'M';
      } else {
        this.currentType = 'S';
      }
    } else {
      this.countNextGlobalOptionId();
    }
  }

  // 切換單選/複選
  chooseBtn(type: 'S' | 'M') {
    this.currentType = type;
    if (type == 'S') {
      this.customizedData.maxSelect = 1;
    } else {
      // 如果切換到複選，預設至少可以選10個
      this.customizedData.maxSelect = this.customizedData.maxSelect = 10;
    }
  }

  // 新增選項
  addOption() {
    this.customizedData.optionDetail.push({
      option: '',
      addPrice: 0
    });
  }

  // 刪除選項
  removeOption(index: number) {
    this.customizedData.optionDetail.splice(index, 1);
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    // 檢查 categoryId
    if (this.customizedData.categoryId == 0) {
      return;
    }

    if (this.isEditMode) {
      this.updateCheck(); // >更新
    } else {
      this.createCheck(); // >新增
    }

  }

  // 新增
  createCheck() {
    this.countNextGlobalOptionId();
    this.httpClientService.postApi('option/add', this.customizedData)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dialogRef.close(true);
        }
      })
  }

  // 更新
  updateCheck() {
    this.httpClientService.postApi('option/update', this.customizedData)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dialogRef.close(true);
        }
      });
  }

  // 計算下一個 ID
  countNextGlobalOptionId() {
    // 取得所有分類
    const categories = this.dataService.allCategoryDto;

    // 如果完全沒分類，就從 1 開始
    if (!categories || categories.length == 0) {
      this.customizedData.optionId = 1;
      return;
    }

    let maxId = 0;
    let completedCount = 0;
    const totalCount = categories.length;

    // 針對每一個分類發送 API
    for (const cat of categories) {
      this.httpClientService.getApi(`option/list?categoryId=${cat.categoryId}`)
        .subscribe((res: any) => {

          if (res.code == 200 && res.optionVoList) {
            const list = res.optionVoList;
            // 所有選項
            for (const opt of list) {
              const oid = Number(opt.optionId);
              if (oid > maxId) {
                maxId = oid;
              }
            }
          }
          completedCount++;

          // 判斷是否全部跑完
          if (completedCount == totalCount) {
            this.customizedData.optionId = maxId + 1;
          }
        });
    }
  }

}
