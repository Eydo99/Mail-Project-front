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

  /**
   * Get all folders
   * GET /api/folders
   */
  getAllFolders(): Observable<FolderData[]> {
    return this.http.get<FolderData[]>(this.apiUrl);
  }

  /**
   * Get folder by ID
   * GET /api/folders/{id}
   */
  getFolderById(folderId: string): Observable<FolderData> {
    return this.http.get<FolderData>(`${this.apiUrl}/${folderId}`);
  }

  /**
   * Create new folder
   * POST /api/folders
   */
  createFolder(request: FolderRequest): Observable<FolderData> {
    return this.http.post<FolderData>(this.apiUrl, request);
  }

  /**
   * Update folder
   * PUT /api/folders/{id}
   */
  updateFolder(folderId: string, request: FolderRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${folderId}`, request);
  }

  /**
   * Delete folder
   * DELETE /api/folders/{id}
   */
  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${folderId}`);
  }

  /**
   * Get all emails in a folder
   * GET /api/folders/{id}/emails
   */
  getEmailsByFolder(folderId: string): Observable<Email[]> {
    return this.http.get<Email[]>(`${this.apiUrl}/${folderId}/emails`);
  }

  /**
   * Update folder email count
   * PATCH /api/folders/{id}/count
   */
  updateFolderCount(folderId: string, count: number): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<void>(`${this.apiUrl}/${folderId}/count`, { count }, { headers });
  }

  /**
   * Increment folder email count
   * PATCH /api/folders/{id}/increment
   */
  incrementFolderCount(folderId: string, increment: number): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<void>(`${this.apiUrl}/${folderId}/increment`, { increment }, { headers });
  }

  /**
   * Move email to custom folder
   * PUT /api/emails/{id}/move
   */
  moveEmailToFolder(emailId: string, fromFolder: string, toFolderId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const toFolder = toFolderId.startsWith('folder_') ? toFolderId : `folder_${toFolderId}`;
    
    return this.http.put(
      `${this.emailApiUrl}/${emailId}/move`,
      { fromFolder, toFolder },
      { headers }
    );
  }

  /**
   * Bulk move emails to folder
   * PUT /api/emails/bulk-move
   */
  bulkMoveToFolder(emailIds: string[], fromFolder: string, toFolderId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const toFolder = toFolderId.startsWith('folder_') ? toFolderId : `folder_${toFolderId}`;
    
    return this.http.put(
      `${this.emailApiUrl}/bulk-move`,
      { emailIds, fromFolder, toFolder },
      { headers }
    );
  }

  /**
   * Delete email from custom folder
   * DELETE /api/emails/{id}?folder=folder_123
   */
  deleteEmailFromFolder(emailId: string, folderId: string): Observable<any> {
    const folder = folderId.startsWith('folder_') ? folderId : `folder_${folderId}`;
    const params = new HttpParams().set('folder', folder);
    
    return this.http.delete(`${this.emailApiUrl}/${emailId}`, { params });
  }

  /**
   * Bulk delete emails from folder
   * DELETE /api/emails/bulk-delete
   */
  bulkDeleteFromFolder(emailIds: string[], folderId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const folder = folderId.startsWith('folder_') ? folderId : `folder_${folderId}`;
    
    return this.http.request(
      'delete',
      `${this.emailApiUrl}/bulk-delete`,
      {
        headers,
        body: { emailIds, folderId: folder }
      }
    );
  }

  /**
   * Mark email as read in folder
   */
  markAsRead(emailId: string): Observable<any> {
    return this.http.patch(`${this.emailApiUrl}/${emailId}/read`, {});
  }

  /**
   * Toggle star on email in folder
   */
  toggleStar(emailId: string, folderId?: string): Observable<any> {
    let params = new HttpParams();
    if (folderId) {
      params = params.set('folderId', folderId);
    }
    
    return this.http.patch(`${this.emailApiUrl}/${emailId}/star`, {}, { params });
  }
}