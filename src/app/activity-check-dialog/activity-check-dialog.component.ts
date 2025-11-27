import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

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
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data.id],
      title: [this.data.title, Validators.required],
      description: [this.data.description, Validators.required],
      startDate: [this.data.startDate ? this.formatDateForInput(this.data.startDate) : null],
      endDate: [this.data.endDate ? this.formatDateForInput(this.data.endDate) : null],
    });
    this.newPhotoUrl = this.data.photo;
  }

  private formatDateForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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

  onSave(action: 'saveDraft' | 'publish'): void {
    this.dialogRef.close({
      action: action,
      data: {
        ...this.form.value,
        status: action === 'publish' ? 'published' : 'draft'
      },
      photoFile: this.newPhotoFile
    });
  }

  onSaveDraftClick() {
    this.onSave('saveDraft');
  }

  onPublishClick() {
    this.onSave('publish');
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
