import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../@service/data.service';

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

  constructor(
    public dialogRef: MatDialogRef<ActivityCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      calendarId: [this.data.calendarId],
      calendarTitle: [this.data.calendarTitle, Validators.required],
      calendarDescription: [this.data.calendarDescription, Validators.required],
      calendarStartDate: [this.data.calendarStartDate ? this.formatDateForInput(this.data.calendarStartDate) : null],
      calendarEndDate: [this.data.calendarEndDate ? this.formatDateForInput(this.data.calendarEndDate) : null],
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
    const startDateWithTime = this.form.value.calendarStartDate + ' 00:00:00';
    const endDateWithTime = this.form.value.calendarEndDate + ' 00:00:00';

    let photoName: string | null = null;
    if (this.newPhotoFile) {
        photoName = this.newPhotoFile.name;
    } else if (this.data.calendarPhoto) {
        const parts = this.data.calendarPhoto.split('/');
        photoName = parts[parts.length - 1];
    }

    const updatedActivityData = {
      calendarId: this.form.value.calendarId,
      calendarTitle: this.form.value.calendarTitle,
      calendarDescription: this.form.value.calendarDescription,
      calendarStartDate: startDateWithTime,
      calendarEndDate: endDateWithTime,
      calendarPhoto: photoName,
      calendarStatus: status
    };

    this.dataService.postApi('http://localhost:8080/calendar/update', updatedActivityData)
      .subscribe((res: any) => {
        console.log(res);
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
        alert('刪除失敗：缺少活動ID。');
        this.dialogRef.close();
        return;
    }
    const deleteUrlWithParam = `http://localhost:8080/calendar/del?calendarId=${id}`;

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
