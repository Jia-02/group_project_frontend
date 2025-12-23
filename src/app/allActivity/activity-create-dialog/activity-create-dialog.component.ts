import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DialogNoticeComponent } from '../../@dialog/dialog-notice/dialog-notice.component';

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
    MatIconModule
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
  readonly dialog = inject(MatDialog);

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
  ) { }

  onStartDateChange(): void {
    if (this.data.calendarStartDate) {
      if (!this.data.calendarEndDate || this.data.calendarStartDate > this.data.calendarEndDate) {
        this.data.calendarEndDate = this.data.calendarStartDate;
      }
    }
  }

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
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'isRequired' }
      });
      return;
    }

    const startDate = new Date(this.data.calendarStartDate);
    const endDate = new Date(this.data.calendarEndDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'timeCheck' }
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'timeCheck' }
      });
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
