import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Inbox, Star, Send, FileText, Trash2, Users, Settings, Plus, FolderOpen,Folder } from 'lucide-angular';
import { ComposeService } from '../../core/services/compose.service';
export interface Folder {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Lucide icons
  Inbox = Inbox;
  Star = Star;
  Send = Send;
  FileText = FileText;
  Trash2 = Trash2;
  Users = Users;
  Settings = Settings;
  Plus = Plus;
  FolderOpen = FolderOpen;
  folder=Folder;

  isOpen = true;
  folders: Folder[] = [];
  showFolderModal = false;

  constructor(
  private router: Router,
  private composeService: ComposeService
) {}

  ngOnInit(): void {
    this.loadFolders();
  }

  loadFolders(): void {
    // Mock folders
    this.folders = [
      { id: '1', name: 'Work', icon: '💼', isDefault: true },
      { id: '2', name: 'Personal', icon: '👤', isDefault: true },
      { id: '3', name: 'Projects', icon: '📋', isDefault: false },
      { id: '4', name: 'Important', icon: '⭐', isDefault: false },
      { id: '5', name: 'Family', icon: '🏠', isDefault: false },
      { id: '6', name: 'Finance', icon: '💡', isDefault: false },
      { id: '7', name: 'Travel', icon: '✈️', isDefault: false },
      { id: '8', name: 'Health', icon: '🏥', isDefault: false },
      { id: '9', name: 'Shopping', icon: '🛒', isDefault: false },
      { id: '10', name: 'Newsletter', icon: '📰', isDefault: false }
    ];
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

  navigateToFolder(folder: Folder): void {
    // Navigate to folder view with folder ID
    this.router.navigate(['folder', folder.id]);
  }

  openManageFolders(): void {
    // Open manage folders modal or navigate to folders page
    this.router.navigate(['folders']);
  }

  openCompose(): void {
  this.composeService.openCompose();
}
}