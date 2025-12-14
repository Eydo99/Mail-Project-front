import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommandManager } from './commands/command-manager.service';
import { UpdateFieldCommand } from './commands/update-field.command';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  public commandManager = inject(CommandManager);
  
  profileForm!: FormGroup;
  showHistory = false;
  isSaving = false;
  profilePhoto: string = 'assets/default-avatar.png';
  originalValues: any = {};
  
  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      jobTitle: [''],
      phone: [''],
      bio: ['', Validators.maxLength(500)]
    });
    
    this.loadProfile();
  }
  
  loadProfile(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    this.http.get<any>('http://localhost:8080/api/user/profile', { withCredentials: true })
      .subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            fullName: profile.fullName || '',
            email: user.email || '',
            jobTitle: profile.jobTitle || '',
            phone: profile.phone || '',
            bio: profile.bio || ''
          });
          
          this.profilePhoto = profile.profilePhoto || 'assets/default-avatar.png';
          this.originalValues = { ...this.profileForm.getRawValue(), profilePhoto: this.profilePhoto };
        },
        error: () => {
          this.profileForm.patchValue({ email: user.email });
          this.originalValues = { ...this.profileForm.getRawValue() };
        }
      });
  }
  
  onFieldChange(fieldName: string): void {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.dirty || control.invalid) return;
    
    const oldValue = this.originalValues[fieldName];
    const newValue = control.value;
    
    if (oldValue !== newValue) {
      const command = new UpdateFieldCommand(this.profileForm, fieldName, oldValue, newValue);
      this.commandManager.execute(command);
      this.originalValues[fieldName] = newValue;
      control.markAsPristine();
    }
  }
  
  undo(): void {
    this.commandManager.undo();
  }
  
  redo(): void {
    this.commandManager.redo();
  }
  
  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }
  
  onPhotoSelect(event: any): void {
    const file = event.target.files[0];
    if (!file || file.size > 1024 * 1024) {
      alert('Photo must be under 1MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profilePhoto = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  saveAll(): void {
    if (!this.profileForm.valid) {
      alert('Please fill in all required fields');
      return;
    }
    
    this.isSaving = true;
    
    const profileData = {
      ...this.profileForm.getRawValue(),
      profilePhoto: this.profilePhoto
    };
    
    this.http.put('http://localhost:8080/api/user/profile', profileData, { withCredentials: true })
      .subscribe({
        next: () => {
          this.commandManager.clearHistory();
          this.originalValues = { ...this.profileForm.getRawValue(), profilePhoto: this.profilePhoto };
          this.isSaving = false;
          alert('Profile saved successfully!');
        },
        error: (err: any) => {
          this.isSaving = false;
          alert('Error saving profile');
        }
      });
  }
  
  discardAll(): void {
    if (confirm('Discard all changes?')) {
      while (this.commandManager.canUndo()) {
        this.commandManager.undo();
      }
      this.commandManager.clearHistory();
      this.loadProfile();
    }
  }
  
  logout(): void {
    if (this.commandManager.hasChanges()) {
      if (!confirm('You have unsaved changes. Logout anyway?')) return;
    }
    
    console.log('🚪 Logging out...');
    
    // Call logout endpoint to invalidate session
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Session invalidated on server');
        // Clear local storage
        localStorage.removeItem('currentUser');
        // Navigate to login
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('❌ Logout error:', err);
        // Even if logout fails, clear local data and redirect
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });
  }
}