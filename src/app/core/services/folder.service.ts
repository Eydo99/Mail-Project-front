// app/core/services/folder.service.ts
// Refactored to match contact service pattern - NO CACHING

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Email } from '../models/email.model';

export interface FolderData {
  id?: string;
  name: string;
  description?: string;
  color: string;
  emailCount?: number;
}

export interface FolderRequest {
  name: string;
  description?: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = 'http://localhost:8080/api/folders';
  private emailApiUrl = 'http://localhost:8080/api/emails';

  constructor(private http: HttpClient) {}

  getAllFolders(): Observable<FolderData[]> {
    return this.http.get<FolderData[]>(this.apiUrl, {
      withCredentials: true
    });
  }

  getFolderById(folderId: string): Observable<FolderData> {
    return this.http.get<FolderData>(`${this.apiUrl}/${folderId}`, {
      withCredentials: true
    });
  }

  createFolder(request: FolderRequest): Observable<FolderData> {
    return this.http.post<FolderData>(this.apiUrl, request, {
      withCredentials: true
    });
  }

  updateFolder(folderId: string, request: FolderRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${folderId}`, request, {
      withCredentials: true
    });
  }

  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${folderId}`, {
      withCredentials: true
    });
  }

  getEmailsByFolder(folderId: string): Observable<Email[]> {
    return this.http.get<Email[]>(`${this.apiUrl}/${folderId}/emails`, {
      withCredentials: true
    });
  }

  updateFolderCount(folderId: string, count: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${folderId}/count`, { count }, {
      withCredentials: true
    });
  }

  incrementFolderCount(folderId: string, increment: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${folderId}/increment`, { increment }, {
      withCredentials: true
    });
  }

  moveEmailToFolder(emailId: string, fromFolder: string, toFolderId: string): Observable<any> {
    const toFolder = toFolderId.startsWith('folder_') ? toFolderId : `folder_${toFolderId}`;
    
    return this.http.put(
      `${this.emailApiUrl}/${emailId}/move`,
      { fromFolder, toFolder },
      { withCredentials: true }
    );
  }

  bulkMoveToFolder(emailIds: string[], fromFolder: string, toFolderId: string): Observable<any> {
    const toFolder = toFolderId.startsWith('folder_') ? toFolderId : `folder_${toFolderId}`;
    
    return this.http.put(
      `${this.emailApiUrl}/bulk-move`,
      { emailIds, fromFolder, toFolder },
      { withCredentials: true }
    );
  }

  deleteEmailFromFolder(emailId: string, folderId: string): Observable<any> {
    const folder = folderId.startsWith('folder_') ? folderId : `folder_${folderId}`;
    const params = new HttpParams().set('folder', folder);
    
    return this.http.delete(`${this.emailApiUrl}/${emailId}`, {
      params,
      withCredentials: true
    });
  }

  bulkDeleteFromFolder(emailIds: string[], folderId: string): Observable<any> {
    const folder = folderId.startsWith('folder_') ? folderId : `folder_${folderId}`;
    
    return this.http.request(
      'delete',
      `${this.emailApiUrl}/bulk-delete`,
      {
        body: { emailIds, folderId: folder },
        withCredentials: true
      }
    );
  }

  markAsRead(emailId: string): Observable<any> {
    return this.http.patch(`${this.emailApiUrl}/${emailId}/read`, {}, {
      withCredentials: true
    });
  }

  toggleStar(emailId: string, folderId?: string): Observable<any> {
    let params = new HttpParams();
    if (folderId) {
      params = params.set('folderId', folderId);
    }
    
    return this.http.patch(`${this.emailApiUrl}/${emailId}/star`, {}, {
      params,
      withCredentials: true
    });
  }
}
