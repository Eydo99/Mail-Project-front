import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Inbox, Star, Send, FileText, Trash2, Users, Settings, Plus, FolderOpen } from 'lucide-angular';
import { FolderService } from '../../core/services/folder.service';
import { ComposeService } from '../../core/services/compose.service';

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
    private folderService: FolderService,
    private composeService: ComposeService
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
    console.log('Navigating to:', route); // Debug log
    this.router.navigate([route]).then(success => {
      console.log('Navigation success:', success);
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }

  openCompose(): void {
    this.composeService.openCompose();
    console.log('opening compose...');
  }
}