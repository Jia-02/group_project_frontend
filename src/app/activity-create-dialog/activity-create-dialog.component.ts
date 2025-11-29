import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-activity-create-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule
  ],
  templateUrl: './activity-create-dialog.component.html',
  styleUrl: './activity-create-dialog.component.scss'
})
export class ActivityCreateDialogComponent {
  data: any = {
    calendarTitle: '',
    calendarDescription: '',
    calendarStartDate: '',
    calendarEndDate: '',
    calendarPhoto: ''
  };

  selectedPhotoFile: File | null = null;
  photoUrl: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ActivityCreateDialogComponent>
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedPhotoFile = input.files[0];
      this.photoUrl = `calendar/images/${this.selectedPhotoFile.name}`;

      this.data.calendarPhoto = this.photoUrl;
    }
  }

  submit() {
    if (!this.data.calendarTitle || !this.data.calendarDescription || !this.data.calendarStartDate ||
      !this.data.calendarEndDate || !this.data.calendarPhoto) {
      alert('請填寫所有必填欄位！');
      return;
    }

    this.dialogRef.close({
      formData: this.data,
      photoFile: this.selectedPhotoFile
    });
  }
}
