import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../@service/data.service';

@Component({
  selector: 'app-activity-check-dialog',
  imports: [
    DatePipe,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
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
  ) {}

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
    const updatedActivityData = {
      calendarId: this.form.value.calendarId,
      calendarTitle: this.form.value.calendarTitle,
      calendarDescription: this.form.value.calendarDescription,
      calendarStartDate: this.form.value.calendarStartDate,
      calendarEndDate: this.form.value.calendarEndDate,
      calendarPhoto: this.data.calendarPhoto,
      calendarStatus: status
    };

    this.dataService.postApi('http://localhost:8080/calendar/update', updatedActivityData)
      .subscribe((res: any) => {
        console.log(res);
        this.dialogRef.close({ action: status ? 'publish' : 'saveDraft', data: updatedActivityData, photoFile: this.newPhotoFile })
      });
  }

  onSaveDraftClick() {
    this.saveActivity(false);
  }

  onPublishClick() {
    this.saveActivity(true);
  }

  onDeleteClick() {
    const id = this.data.calendarId;
    this.dataService.postApi('http://localhost:8080/calendar/del', { calendarId: id })
      .subscribe((res: any) => {
        console.log(res);
        this.dialogRef.close({ action: 'delete', calendarId: id })
      });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
