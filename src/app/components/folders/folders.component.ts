import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Folder {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-folders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.css']
})
export class FoldersComponent implements OnInit {
  folders: Folder[] = [];
  showModal: boolean = false;
  folderName: string = '';
  selectedIcon: string = '📁';
  editingFolder: Folder | null = null;

  availableIcons: string[] = [
    '📁', '💼', '👤', '💬', '⭐', '📋', '🏠', '💡', '🎯', '🎨',
    '✈️', '🏥', '🛒', '📰', '🎓', '🎮', '🎵', '📸', '🍕', '⚽'
  ];

  ngOnInit(): void {
    this.loadFolders();
  }

  loadFolders(): void {
    // Mock folders with variety
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

  openCreateModal(): void {
    this.editingFolder = null;
    this.folderName = '';
    this.selectedIcon = '📁';
    this.showModal = true;
  }

  openEditModal(folder: Folder): void {
    if (folder.isDefault) {
      return; // Don't allow editing default folders
    }
    this.editingFolder = folder;
    this.folderName = folder.name;
    this.selectedIcon = folder.icon;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.folderName = '';
    this.selectedIcon = '📁';
    this.editingFolder = null;
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }

  createOrUpdateFolder(): void {
    if (!this.folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    if (this.editingFolder) {
      // Update existing folder
      this.editingFolder.name = this.folderName.trim();
      this.editingFolder.icon = this.selectedIcon;
    } else {
      // Create new folder
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: this.folderName.trim(),
        icon: this.selectedIcon,
        isDefault: false
      };
      this.folders.push(newFolder);
    }

    this.closeModal();
  }

  deleteFolder(folder: Folder): void {
    if (folder.isDefault) {
      alert('Cannot delete default folders');
      return;
    }

    if (confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      this.folders = this.folders.filter(f => f.id !== folder.id);
    }
  }

  selectFolder(folder: Folder): void {
    console.log('Selected folder:', folder);
    // Implement folder selection logic
  }
}