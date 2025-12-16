import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-activity-create-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatDialogTitle,
  ],
  templateUrl: './activity-create-dialog.component.html',
  styleUrl: './activity-create-dialog.component.scss'
})
export class ActivityCreateDialogComponent {
  public todayDateString: string = '';

  data: any = {
    calendarTitle: '',
    calendarDescription: '',
    calendarStartDate: '',
    calendarEndDate: '',
    calendarPhoto: ''
  };

  selectedPhotoFile: File | null = null;
  photoUrl: string | null = null;

  ngOnInit(): void {
    this.setTodayDateString();
  }

  private setTodayDateString(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    this.todayDateString = `${year}-${month}-${day}`;

    if (this.data.calendarStartDate < this.todayDateString) {
        this.data.calendarStartDate = this.todayDateString;
    }
    if (this.data.calendarEndDate < this.todayDateString) {
        this.data.calendarEndDate = this.todayDateString;
    }
  }

  constructor(
    private dialogRef: MatDialogRef<ActivityCreateDialogComponent>
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedPhotoFile = input.files[0];
      this.photoUrl = this.selectedPhotoFile.name;

      this.data.calendarPhoto = this.photoUrl;
    }
  }

  submit() {
    if (!this.data.calendarTitle || !this.data.calendarDescription || !this.data.calendarStartDate ||
      !this.data.calendarEndDate || !this.data.calendarPhoto) {
      alert('請填寫所有必填欄位！');
      return;
    }

    const startDate = new Date(this.data.calendarStartDate);
    const endDate = new Date(this.data.calendarEndDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      alert('活動開始時間不能晚於活動結束時間！');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert('活動開始日期不能早於今天！');
      return;
    }

    this.dialogRef.close({
      formData: this.data,
      photoFile: this.selectedPhotoFile
    });
  }

  closeDialog(): void {
    this.dialogRef.close();

  }
}
