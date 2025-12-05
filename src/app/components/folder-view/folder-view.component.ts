import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

export interface Folder {
  id: string;
  name: string;
  icon: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
}

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent implements OnInit {
  folderId: string = '';
  currentFolder: Folder | null = null;
  emails: Email[] = [];

  folders: Folder[] = [
    { id: '1', name: 'Work', icon: '💼' },
    { id: '2', name: 'Personal', icon: '👤' },
    { id: '3', name: 'Projects', icon: '📋' },
    { id: '4', name: 'Important', icon: '⭐' },
    { id: '5', name: 'Family', icon: '🏠' },
    { id: '6', name: 'Finance', icon: '💡' },
    { id: '7', name: 'Travel', icon: '✈️' },
    { id: '8', name: 'Health', icon: '🏥' },
    { id: '9', name: 'Shopping', icon: '🛒' },
    { id: '10', name: 'Newsletter', icon: '📰' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.folderId = params['id'];
      this.loadFolder();
      this.loadEmails();
    });
  }

  loadFolder(): void {
    this.currentFolder = this.folders.find(f => f.id === this.folderId) || null;
  }

  loadEmails(): void {
    // Mock emails for the folder
    this.emails = [
      {
        id: '1',
        from: 'john@example.com',
        subject: 'Meeting Tomorrow',
        preview: 'Hi, just confirming our meeting tomorrow at 2 PM...',
        date: '2024-01-15',
        isRead: false
      },
      {
        id: '2',
        from: 'sarah@company.com',
        subject: 'Project Update',
        preview: 'Here is the latest update on the project progress...',
        date: '2024-01-14',
        isRead: true
      },
      {
        id: '3',
        from: 'team@notifications.com',
        subject: 'Weekly Report',
        preview: 'Your weekly summary is ready to review...',
        date: '2024-01-13',
        isRead: true
      }
    ];
  }
}