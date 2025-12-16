import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Email } from '../models/email.model';
import { Attachment } from "../models/attachment";
import { environment } from "../../../environments/environment1";
import {FilterCriteria} from "../../core/models/FilterCriteria"

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = `${environment.apiUrl}/api/mail`;

  // Separate subjects for each folder
  private inboxEmailsSubject = new BehaviorSubject<Email[]>([]);
  private sentEmailsSubject = new BehaviorSubject<Email[]>([]);
  private draftEmailsSubject = new BehaviorSubject<Email[]>([]);
  private trashEmailsSubject = new BehaviorSubject<Email[]>([]);
  private starredEmailsSubject = new BehaviorSubject<Email[]>([]);

  // Public observables
  public inboxEmails$ = this.inboxEmailsSubject.asObservable();
  public sentEmails$ = this.sentEmailsSubject.asObservable();
  public draftEmails$ = this.draftEmailsSubject.asObservable();
  public trashEmails$ = this.trashEmailsSubject.asObservable();
  public starredEmails$ = this.starredEmailsSubject.asObservable();

  // Keep for backward compatibility
  public emails$ = this.inboxEmails$;

  constructor(private http: HttpClient) {
    this.loadInboxEmails();
  }

  /**
   * Map backend DTO to frontend Email model
   */
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

  /**
   * Extract sender name from email
   */
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

  /**
   * Load inbox emails from backend (initial load)
   */
  private loadInboxEmails(): void {
    this.http.post<any[]>(`${this.apiUrl}/inbox`, {}, {
      params: { sort: 'date-desc' },
      withCredentials: true
    }).subscribe({
      next: emails => this.inboxEmailsSubject.next(this.mapBackendToFrontend(emails)),
      error: err => console.error('Error loading inbox emails:', err),
    });
  }

  /**
   * Get emails for a specific folder (returns observable)
   */
  getEmails(folder: string = 'inbox'): Observable<Email[]> {
    switch (folder) {
      case 'inbox':
        return this.inboxEmails$;
      case 'sent':
        return this.sentEmails$;
      case 'draft':
        return this.draftEmails$;
      case 'trash':
        return this.trashEmails$;
      case 'starred':
        return this.starredEmails$;
      default:
        return this.inboxEmails$;
    }
  }

  /**
   * Refresh folder with filtering and sorting (NEW - uses backend)
   */
  refreshFolder(folder: string, sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.http.post<any[]>(`${this.apiUrl}/${folder}`, filters || {}, {
      params: { sort },
      withCredentials: true
    }).pipe(
      map(emails => this.mapBackendToFrontend(emails)),
      tap(emails => {
        switch (folder) {
          case 'inbox':
            this.inboxEmailsSubject.next(emails);
            break;
          case 'sent':
            this.sentEmailsSubject.next(emails);
            break;
          case 'draft':
            this.draftEmailsSubject.next(emails);
            break;
          case 'trash':
            this.trashEmailsSubject.next(emails);
            break;
          case 'starred':
            this.starredEmailsSubject.next(emails);
            break;
        }
      })
    );
  }



  /**
   * Get inbox emails with filters and sorting
   */
  getInboxEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.refreshFolder('inbox', sort, filters);
  }



  /**
   * Get inbox emails sorted by priority (using backend Priority Queue)
   */
  getInboxEmailsByPriority(): Observable<Email[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox/priority`, {
      withCredentials: true
    }).pipe(
      map(emails => this.mapBackendToFrontend(emails)),
      tap(emails => this.inboxEmailsSubject.next(emails))
    );
  }

  /**
   * Get sent emails with filters and sorting
   */
  getSentEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.refreshFolder('sent', sort, filters);
  }

  /**
   * Get draft emails with filters and sorting
   */
  getDraftEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.refreshFolder('draft', sort, filters);
  }

  /**
   * Get trash emails with filters and sorting
   */
  getTrashEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.refreshFolder('trash', sort, filters);
  }

  /**
   * Search custom folder emails with filtering and sorting
   */
  searchCustomFolderEmails(
    folderId: string,
    sort: string = 'date-desc',
    filters?: FilterCriteria
  ): Observable<Email[]> {
    const params = new HttpParams().set('sort', sort);

    return this.http.post<any[]>(
      `${this.apiUrl}/folder/${folderId}/search`,
      filters || {},
      {
        params: params,
        withCredentials: true
      }
    ).pipe(
      map(emails => this.mapBackendToFrontend(emails))
    );
  }

  /**
   * Get starred emails with filters and sorting
   */
  getStarredEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.refreshFolder('starred', sort, filters);
  }

  /**
   * Refresh starred emails
   */
  refreshStarredEmails(sort: string = 'date-desc', filters?: any): Observable<Email[]> {
    return this.getStarredEmails(sort, filters);
  }

  /**
   * Refresh emails from backend (backward compatibility)
   */
  refreshEmails(): Observable<Email[]> {
    return this.getInboxEmails();
  }

  /**
   * Get specific email by ID
   */
  getEmailById(id: string, folder: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}?folder=${folder}`, {
      withCredentials: true
    });
  }

  /**
   * Toggle star status
   */
  toggleStar(emailId: string, folder: string = 'inbox'): void {
    const subject = this.getSubjectByFolder(folder);
    const emails = subject.value;
    const email = emails.find(e => e.id === emailId);

    if (email) {
      email.isStarred = !email.isStarred;
      subject.next([...emails]);

      this.http.put(`${this.apiUrl}/${emailId}/star?folder=${folder}`, {}, { withCredentials: true }).subscribe({
        error: (error) => {
          email.isStarred = !email.isStarred;
          subject.next([...emails]);
          console.error('Error toggling star:', error);
        }
      });
    }
  }

  /**
   * Mark email as read
   */
  markAsRead(emailId: string): void {
    const emails = this.inboxEmailsSubject.value;
    const email = emails.find(e => e.id === emailId);
    if (email) {
      this.inboxEmailsSubject.next([...emails]);
    }
  }

  /**
   * Compose/send a new email
   */
  composeMail(email: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/compose`, email, {
      withCredentials: true
    });
  }

  /**
   * Save email as draft
   */
  saveDraft(email: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/draft/save`, email, {
      responseType: 'text',
      withCredentials: true
    });
  }

  /**
   * Delete an email
   */
  deleteEmail(emailId: string, folder: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${emailId}?folder=${folder}`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  /**
   * Move email to another folder
   */
  moveEmail(emailId: string, fromFolder: string, toFolder: string): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${emailId}/move?fromFolder=${fromFolder}&toFolder=${toFolder}`,
      {},
      {
        responseType: 'text',
        withCredentials: true
      }
    );
  }

  /**
   * Get attachment file URL for viewing/downloading
   */
  getAttachmentUrl(filePath: string): string {
    const filename = filePath.split('/').pop() || filePath;
    const encodedFilename = encodeURIComponent(filename);
    return `http://localhost:8080/api/attachments/uploads/${encodedFilename}`;
  }

  /**
   * Download attachment
   */
  downloadAttachment(attachment: Attachment): void {
    const url = this.getAttachmentUrl(attachment.filePath);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * View attachment (open in new tab)
   */
  viewAttachment(attachment: Attachment): void {
    const url = this.getAttachmentUrl(attachment.filePath);
    window.open(url, '_blank');
  }

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get icon for file type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'assets/icons/pdf.png';
    if (mimeType.includes('image')) return 'assets/icons/image.png';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'assets/icons/doc.png';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'assets/icons/excel.png';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'assets/icons/zip.png';
    return 'assets/icons/file.png';
  }

  /**
   * Get the BehaviorSubject for a specific folder
   */
  private getSubjectByFolder(folder: string): BehaviorSubject<Email[]> {
    switch (folder) {
      case 'inbox':
        return this.inboxEmailsSubject;
      case 'sent':
        return this.sentEmailsSubject;
      case 'draft':
        return this.draftEmailsSubject;
      case 'trash':
        return this.trashEmailsSubject;
      case 'starred':
        return this.starredEmailsSubject;
      default:
        return this.inboxEmailsSubject;
    }
  }
}
