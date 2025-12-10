// app/core/services/folder.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Email } from '../models/email.model';
import { MailService } from './mail.service'; //

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

  constructor(private http: HttpClient, private mailService: MailService) {}

  getAllFolders(): Observable<FolderData[]> {
    return this.http.get<FolderData[]>(this.apiUrl, { withCredentials: true });
  }

  getFolderById(folderId: string): Observable<FolderData> {
    return this.http.get<FolderData>(`${this.apiUrl}/${folderId}`, { withCredentials: true });
  }

  createFolder(request: FolderRequest): Observable<FolderData> {
    return this.http.post<FolderData>(this.apiUrl, request, { withCredentials: true });
  }

  updateFolder(folderId: string, request: FolderRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${folderId}`, request, { withCredentials: true });
  }

  /**
   * Fixed deleteFolder:
   * 1. Gets emails using the raw UUID (correct for api/folders endpoints).
   * 2. Formats the folder ID with 'folder_' prefix for the MailService call.
   * 3. Deletes emails via MailService, then deletes the folder.
   */
  deleteFolder(folderId: string): Observable<void> {
    return this.getEmailsByFolder(folderId).pipe(
      switchMap(emails => {
        if (!emails || emails.length === 0) {
          return this.http.delete<void>(`${this.apiUrl}/${folderId}`, {
            withCredentials: true
          });
        }

        // FIX: Ensure the folder parameter has the 'folder_' prefix
        // This matches the pattern used in moveEmailToFolder and other methods
        const folderParam = folderId.startsWith('folder_') ? folderId : `folder_${folderId}`;

        // Call deleteEmail for each email with the prefixed folder ID
        const deleteEmailObservables = emails.map(email =>
          this.mailService.deleteEmail(email.id, folderParam) //
        );

        return forkJoin(deleteEmailObservables).pipe(
          switchMap(() =>
            this.http.delete<void>(`${this.apiUrl}/${folderId}`, {
              withCredentials: true
            })
          )
        );
      })
    );
  }

  getEmailsByFolder(folderId: string): Observable<Email[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${folderId}/emails`, {
      withCredentials: true
    }).pipe(
      map(emails => this.mapBackendToFrontend(emails)),
    );
  }

  private mapBackendToFrontend(backendEmails: any[]): Email[] {
    return backendEmails.map(email => ({
      id: email.id.toString(),
      sender: this.extractSenderName(email.from),
      senderEmail: email.from || 'unknown@mail.com',
      subject: email.subject,
      preview: email.preview,
      body: email.body,
      timestamp: new Date(email.timestamp),
      isStarred: email.starred,
      hasAttachment: email.hasAttachment,
      priority: email.priority,
      attachments: email.attachments || []
    }));
  }

  private extractSenderName(from: string[] | string): string {
    if (!from) return 'Unknown';
    if (typeof from === 'string') {
      const name = from.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (Array.isArray(from) && from.length > 0) {
      const email = from[0];
      const name = email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Unknown';
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
    return this.http.patch(`${this.emailApiUrl}/${emailId}/read`, {}, { withCredentials: true });
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
