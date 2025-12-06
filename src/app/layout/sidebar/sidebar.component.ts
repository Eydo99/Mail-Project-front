import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Inbox, Star, Send, FileText, Trash2, Users, Settings, Plus, FolderOpen } from 'lucide-angular';
import { FolderService } from '../../core/services/folder.service';

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

  isOpen = true;
  totalFolderCount = 0;

  constructor(
    private router: Router,
    private folderService: FolderService
  ) {}

  ngOnInit(): void {
    // Load total folder count for badge
    this.folderService.getAllFolders().subscribe(folders => {
      this.totalFolderCount = folders.length;
    });
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
    console.log('Opening compose...');
  }
}