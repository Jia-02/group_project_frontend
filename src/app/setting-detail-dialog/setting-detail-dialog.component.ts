import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setting-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIcon,
    FormsModule,
  ],
  templateUrl: './setting-detail-dialog.component.html',
  styleUrl: './setting-detail-dialog.component.scss'
})
export class SettingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SettingDetailDialogComponent>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: FullSettingDetail,
  ) { }

  public quantity: number = 1;
  public currentPrice: number = 0;

  public currentSelections: Map<number, Set<string>> = new Map();
  public selectedMainProduct: Map<number, number> = new Map();
  public selectedMainProductPrice: Map<number, number> = new Map();

  public settingOptionList: OptionDetail[] = [];

  ngOnInit(): void {
    if (this.data.settingDetail && this.data.settingDetail.length > 0) {
      this.settingOptionList = this.data.settingDetail[0].optionList || [];
    }

    this.settingOptionList.forEach(group => {
      this.currentSelections.set(group.optionId, new Set<string>());
    });

    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let optionsPrice = 0;

    this.settingOptionList.forEach(group => {
      const selectedOptions = this.currentSelections.get(group.optionId);
      if (selectedOptions) {
        group.optionDetail.forEach(item => {
          if (selectedOptions.has(item.option)) {
            optionsPrice += item.addPrice;
          }
        });
      }
    });

    this.currentPrice = (this.data.settingPrice + optionsPrice) * this.quantity;
  }

  incrementQuantity(): void {
    this.quantity++;
    this.calculateTotalPrice();
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculateTotalPrice();
    }
  }

  handleMainProductChange(categoryGroup: setting, productItem: Detail): void {

    this.selectedMainProduct.set(categoryGroup.categoryId, productItem.productId);

    this.selectedMainProductPrice.set(categoryGroup.categoryId, productItem.productPrice);

    this.calculateTotalPrice();
  }

  handleOptionRadioChange(group: OptionDetail, optionItem: Option): void {
    const selectedOptions = this.currentSelections.get(group.optionId);
    if (!selectedOptions) return;

    selectedOptions.clear();
    selectedOptions.add(optionItem.option);
    this.calculateTotalPrice();
  }

  handleOptionCheckboxChange(group: OptionDetail, optionItem: Option, isChecked: boolean): void {
    const selectedOptions = this.currentSelections.get(group.optionId);

    if (!selectedOptions) {
      return;
    }

    if (isChecked) {
      if (selectedOptions.size < group.maxSelect) {
        selectedOptions.add(optionItem.option);
      }
    } else {
      selectedOptions.delete(optionItem.option);
    }

    this.calculateTotalPrice();
  }

  addToCart(): void {
    const selectedOptionsMap: { [key: number]: string[] } = {};
    this.currentSelections.forEach((options, optionId) => {
      selectedOptionsMap[optionId] = Array.from(options);
    });

    const selectedMainProducts: { [key: number]: number } = {};
    this.selectedMainProduct.forEach((productId, categoryId) => {
      selectedMainProducts[categoryId] = productId;
    });

    const itemToAdd = {
      price: this.currentPrice,
      quantity: this.quantity,
      selectedOptions: selectedOptionsMap,
      selectedMainProducts: selectedMainProducts
    }

    this.dialogRef.close(itemToAdd);
  }
}

interface FullSettingDetail {
  categoryId: number;
  settingId: number;
  settingName: string;
  settingPrice: number;
  settingImg: string;
  settingActive: boolean;
  settingNote: string;
  quantity: number;
  settingDetail: setting[];
}

interface setting {
  categoryId: number;
  categoryType: string;
  workstationId: number;
  detailList: Detail[];
  optionList: OptionDetail[];
}
interface OptionDetail {
  optionId: number;
  optionName: string;
  maxSelect: number;
  optionDetail: Option[];
}

interface Option {
  option: string;
  addPrice: number;
}

interface Detail {
  productId: number;
  productName: string;
  productPrice: number;
  productDescription: string;
  productNote: string;
  imageUrl: string;
}

