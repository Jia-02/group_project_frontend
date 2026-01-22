import { Component, inject, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../@service/data.service';
import { DialogNoticeComponent } from '../../@dialog/dialog-notice/dialog-notice.component';

@Component({
  selector: 'app-activity-check-dialog',
  imports: [
    DatePipe,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatDialogTitle,
  ],
  templateUrl: './activity-check-dialog.component.html',
  styleUrl: './activity-check-dialog.component.scss'
})
export class ActivityCheckDialogComponent {
  form!: FormGroup;
  newPhotoFile: File | null = null;
  newPhotoUrl: string | ArrayBuffer | null = null;
  readonly dialog = inject(MatDialog);

  // 確保你有宣告 today
  today = new Date().toISOString().split('T')[0];

  // 定義 getter 抓取開始日期的值
  get minEndDate(): string {
    const startDate = this.form.get('calendarStartDate')?.value;
    // 如果開始日期還沒選，就預設為 today，否則回傳開始日期
    return startDate ? startDate : this.today;
  }

  constructor(
    public dialogRef: MatDialogRef<ActivityCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    console.log('dialog data type:', typeof this.data.calendarStartDate, this.data.calendarStartDate);


    this.form = this.fb.group({
      calendarId: [this.data.calendarId],
      calendarTitle: [this.data.calendarTitle, Validators.required],
      calendarDescription: [this.data.calendarDescription, Validators.required],
      calendarStartDate: [this.formatDateForInput(this.data.calendarStartDate), Validators.required],
      calendarEndDate: [this.formatDateForInput(this.data.calendarEndDate), Validators.required],
    });


    this.newPhotoUrl = this.data.calendarPhoto;
  }

  private formatDateForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.newPhotoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.newPhotoUrl = reader.result;
      };
      reader.readAsDataURL(this.newPhotoFile);
    }
  }

  private saveActivity(status: boolean) {

    let photoName: string | null = null;
    if (this.newPhotoFile) {
      photoName = this.newPhotoFile.name;
    } else if (this.data.calendarPhoto) {
      const parts = this.data.calendarPhoto.split('/');
      photoName = parts[parts.length - 1];
    }

    const start = new Date(this.form.value.calendarStartDate);
    const end = new Date(this.form.value.calendarEndDate);

    // 格式化為 YYYY-MM-DD HH:mm:ss
    const formatDateTime = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d} 00:00:00`;
    };

    const updatedActivityData = {
      calendarId: this.form.value.calendarId,
      calendarTitle: this.form.value.calendarTitle,
      calendarDescription: this.form.value.calendarDescription,
      calendarStartDate: formatDateTime(start),
      calendarEndDate: formatDateTime(end),
      calendarPhoto: photoName, // 保持你原有的圖片處理邏輯
      calendarStatus: status
    };

    this.dataService.postApi('calendar/update', updatedActivityData)
      .subscribe((res: any) => {
        console.log(res);
        console.log(updatedActivityData);
        this.dialogRef.close({ action: status ? 'publish' : 'saveDraft', data: updatedActivityData, photoFile: this.newPhotoFile });
      });
  }

  onSaveDraftClick() {
    this.saveActivity(false);
  }

  onPublishClick() {
    this.saveActivity(true);
  }

  onDeleteClick() {
    const id = this.data?.calendarId;

    if (typeof id === 'undefined' || id === null) {
      console.error('刪除錯誤：無法獲取有效的 calendarId，請確認數據已正確傳入。', this.data);
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'activityIdMiss' }
      })
      this.dialogRef.close();
      return;
    }
    const deleteUrlWithParam = `calendar/del?calendarId=${id}`;

    this.dataService.postApi(deleteUrlWithParam, null)
      .subscribe((res: any) => {
        console.log(res);
        this.dialogRef.close({ action: 'delete', calendarId: id });
      });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
