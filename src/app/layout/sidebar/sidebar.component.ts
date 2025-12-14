import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import {
  LucideAngularModule,
  Inbox, Star, Send, FileText, Trash2,
  Users, Settings, Plus, FolderOpen,
  Mail
} from 'lucide-angular';

import { FolderService } from '../../core/services/folder.service';
import { ComposeService } from '../../core/services/compose.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  Mail = Mail;
  Inbox = Inbox;
  Star = Star;
  Send = Send;
  FileText = FileText;
  Trash2 = Trash2;
  Users = Users;
  Settings = Settings;
  Plus = Plus;
  FolderOpen = FolderOpen;

  isOpen = true;
  totalFolderCount = 0;
  currentRoute = '';

  firstName = '';
  lastName = '';
  profilePhoto: string | null = null;
  
  private profileUpdateListener: any;

  constructor(
    private router: Router,
    private folderService: FolderService,
    private composeService: ComposeService,
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.folderService.getAllFolders().subscribe(folders => {
      this.totalFolderCount = folders.length;
    });

    this.loadProfile();

    this.updateCurrentRoute();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
    });
    
    this.profileUpdateListener = (event: any) => {
      console.log('📢 Sidebar: Profile update event received', event.detail);
      this.updateProfileFromData(event.detail);
    };
    
    window.addEventListener('profile-updated', this.profileUpdateListener);
  }
  
  ngOnDestroy(): void {
    if (this.profileUpdateListener) {
      window.removeEventListener('profile-updated', this.profileUpdateListener);
    }
  }

  private loadProfile(): void {
    this.userProfileService.getProfile().subscribe({
      next: (profile) => {
        this.updateProfileFromData(profile);
      },
      error: (err) => {
        console.error('❌ Error loading profile:', err);
        this.firstName = 'Guest';
        this.lastName = '';
        this.profilePhoto = null;
      }
    });
  }
  
  private updateProfileFromData(profile: any): void {
    if (profile.fullName) {
      const nameParts = profile.fullName.split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
    } else {
      this.firstName = profile.firstName || '';
      this.lastName = profile.lastName || '';
    }
    
    this.profilePhoto = profile.profilePhoto;
    
    console.log('✅ Sidebar profile updated:', {
      firstName: this.firstName,
      lastName: this.lastName,
      hasPhoto: !!this.profilePhoto
    });
  }

  private updateCurrentRoute(): void {
    const url = this.router.url;
    const route = url.split('/')[1] || 'inbox';
    this.currentRoute = route;
  }

  onMouseEnter(): void {
    this.isOpen = true;
  }

  onMouseLeave(): void {
    this.isOpen = false;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  openCompose(): void {
    this.composeService.openCompose();
  }
}