// folder.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { FolderData } from '../../components/folder-modal/folder-modal.component';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private foldersSubject = new BehaviorSubject<FolderData[]>([]);
  public folders$ = this.foldersSubject.asObservable();

  constructor() {
    this.initializeFolders();
  }

  /**
   * Initialize with some default folders
   */
  private initializeFolders(): void {
    const defaultFolders: FolderData[] = [
      {
        id: 'folder-1',
        name: 'Work',
        description: 'Work-related emails',
        color: '#3b82f6',
        emailCount: 42
      },
      {
        id: 'folder-2',
        name: 'Personal',
        description: 'Personal correspondence',
        color: '#8b5cf6',
        emailCount: 28
      },
      {
        id: 'folder-3',
        name: 'Projects',
        description: 'Project updates and discussions',
        color: '#10b981',
        emailCount: 15
      }
    ];

    this.foldersSubject.next(defaultFolders);
  }

  /**
   * Get all folders
   */
  getAllFolders(): Observable<FolderData[]> {
    return this.folders$;
  }

  /**
   * Get folder by ID
   */
  getFolderById(folderId: string): Observable<FolderData | undefined> {
    return this.folders$.pipe(
      map(folders => folders.find(f => f.id === folderId))
    );
  }

  /**
   * Create a new folder
   */
  createFolder(folderData: FolderData): Observable<FolderData> {
    return of(folderData).pipe(
      delay(300), // Simulate API delay
      map(data => {
        const newFolder: FolderData = {
          ...data,
          id: `folder-${Date.now()}`,
          emailCount: 0
        };

        const currentFolders = this.foldersSubject.value;
        this.foldersSubject.next([...currentFolders, newFolder]);

        return newFolder;
      })
    );
  }

  /**
   * Update an existing folder
   */
  updateFolder(folderData: FolderData): Observable<FolderData> {
    return of(folderData).pipe(
      delay(300),
      map(data => {
        const currentFolders = this.foldersSubject.value;
        const updatedFolders = currentFolders.map(folder =>
          folder.id === data.id ? { ...folder, ...data } : folder
        );

        this.foldersSubject.next(updatedFolders);
        return data;
      })
    );
  }

  /**
   * Delete a folder
   * In a real app, this would also move all emails back to inbox
   */
  deleteFolder(folderId: string): Observable<boolean> {
    return of(true).pipe(
      delay(300),
      map(() => {
        const currentFolders = this.foldersSubject.value;
        const filteredFolders = currentFolders.filter(f => f.id !== folderId);
        this.foldersSubject.next(filteredFolders);
        return true;
      })
    );
  }

  /**
   * Update folder email count
   */
  updateFolderCount(folderId: string, count: number): void {
    const currentFolders = this.foldersSubject.value;
    const updatedFolders = currentFolders.map(folder =>
      folder.id === folderId ? { ...folder, emailCount: count } : folder
    );
    this.foldersSubject.next(updatedFolders);
  }

  /**
   * Increment folder email count
   */
  incrementFolderCount(folderId: string, increment: number = 1): void {
    const currentFolders = this.foldersSubject.value;
    const updatedFolders = currentFolders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          emailCount: (folder.emailCount || 0) + increment
        };
      }
      return folder;
    });
    this.foldersSubject.next(updatedFolders);
  }
}