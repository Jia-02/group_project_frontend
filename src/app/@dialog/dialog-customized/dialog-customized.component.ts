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
    this.nextOptionId();
    this.httpClientService.postApi('http://localhost:8080/option/add', this.customizedData)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);
          this.dialogRef.close(true);
        } else {
          console.log(res);
        }
      })
  }

  // 更新
  updateCheck() {
    this.httpClientService.postApi('http://localhost:8080/option/update', this.customizedData)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);
          this.dialogRef.close(true);
        } else {
          console.log(res);
        }
      });
  }

  // 計算下一個 ID
  nextOptionId() {
    const optionlist = this.data.existingOptions || [];
    let maxId = 0;

    // 跑迴圈找出目前最大的 optionId
    for (let opt of optionlist) {
      // 如果是同一個 categoryId
      const currentId = Number(opt.optionId);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    this.customizedData.optionId = maxId + 1; // 新的 ID 為 最大值 + 1
  }

}
