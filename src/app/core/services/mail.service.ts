import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = 'http://localhost:8080/api/mail';

  // Separate subjects for each folder
  private inboxEmailsSubject = new BehaviorSubject<Email[]>([]);
  private sentEmailsSubject = new BehaviorSubject<Email[]>([]);
  private draftEmailsSubject = new BehaviorSubject<Email[]>([]);
  private trashEmailsSubject = new BehaviorSubject<Email[]>([]);

  // Public observables
  public inboxEmails$ = this.inboxEmailsSubject.asObservable();
  public sentEmails$ = this.sentEmailsSubject.asObservable();
  public draftEmails$ = this.draftEmailsSubject.asObservable();
  public trashEmails$ = this.trashEmailsSubject.asObservable();

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
      timestamp: email.timestamp,
      isStarred: email.starred,
      hasAttachment: email.hasAttachment,
      priority: email.priority
    }));
  }

  /**
   * Extract sender name from email
   */
  private extractSenderName(from: string[] | string): string {
    if (!from) return 'Unknown';

    // Handle if 'from' is a string
    if (typeof from === 'string') {
      const name = from.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Handle if 'from' is an array
    if (Array.isArray(from) && from.length > 0) {
      const email = from[0];
      const name = email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    return 'Unknown';
  }

  /**
   * Load inbox emails from backend
   */
  private loadInboxEmails(): void {
    this.http.get<any[]>(`${this.apiUrl}/inbox`).subscribe({
      next: (emails) => {
        const mappedEmails = this.mapBackendToFrontend(emails);
        this.inboxEmailsSubject.next(mappedEmails);
      },
      error: (error) => {
        console.error('Error loading inbox emails:', error);
      }
    });
  }

  /**
   * Get emails for a specific folder (returns observable)
   */
  getEmails(folder: string = 'inbox'): Observable<Email[]> {
    switch(folder) {
      case 'inbox':
        return this.inboxEmails$;
      case 'sent':
        return this.sentEmails$;
      case 'draft':
        return this.draftEmails$;
      case 'trash':
        return this.trashEmails$;
      default:
        return this.inboxEmails$;
    }
  }

  /**
   * Refresh emails for a specific folder
   */
  refreshFolder(folder: string): Observable<Email[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${folder}`).pipe(
      map(emails => this.mapBackendToFrontend(emails)),
      tap(emails => {
        switch(folder) {
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
        }
      })
    );
  }

  /**
   * Get inbox emails with mapping
   */
  getInboxEmails(): Observable<Email[]> {
    return this.refreshFolder('inbox');
  }

  /**
   * Get inbox emails sorted by priority (using backend Priority Queue)
   */
  getInboxEmailsByPriority(): Observable<Email[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox/priority`).pipe(
      map(emails => this.mapBackendToFrontend(emails)),
      tap(emails => this.inboxEmailsSubject.next(emails))
    );
  }

  /**
   * Get sent emails with mapping
   */
  getSentEmails(): Observable<Email[]> {
    return this.refreshFolder('sent');
  }

  /**
   * Get draft emails with mapping
   */
  getDraftEmails(): Observable<Email[]> {
    return this.refreshFolder('draft');
  }

  /**
   * Get trash emails with mapping
   */
  getTrashEmails(): Observable<Email[]> {
    return this.refreshFolder('trash');
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
    return this.http.get<any>(`${this.apiUrl}/${id}?folder=${folder}`);
  }

  /**
   * Toggle star status
   */
  toggleStar(emailId: string, folder: string = 'inbox'): void {
    const subject = this.getSubjectByFolder(folder);
    const emails = subject.value;
    const email = emails.find(e => e.id === emailId);

    if (email) {
      // Optimistic update
      email.isStarred = !email.isStarred;
      subject.next([...emails]);

      // Call backend
      this.http.put(`${this.apiUrl}/${emailId}/star?folder=${folder}`, {}).subscribe({
        error: (error) => {
          // Revert on error
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
 /**
 * Compose/send a new email
 */
composeMail(email: any): Observable<string> {
  return this.http.post(`${this.apiUrl}/compose`, email, {
    responseType: 'text'
  });
}

/**
 * Save email as draft
 */
saveDraft(email: any): Observable<string> {
  return this.http.post(`${this.apiUrl}/draft/save`, email, {
    responseType: 'text'
  });
}


  /**
   * Delete an email
   */
  deleteEmail(emailId: string, folder: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${emailId}?folder=${folder}`, {
      responseType: 'text'  // Add this option
    });
  }

  /**
   * Move email to another folder
   */
  moveEmail(emailId: string, fromFolder: string, toFolder: string): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${emailId}/move?fromFolder=${fromFolder}&toFolder=${toFolder}`,
      {},
      { responseType: 'text'  }  // <-- This fixes the parsing issue
    );
  }
  /**
   * Get the BehaviorSubject for a specific folder
   */
  private getSubjectByFolder(folder: string): BehaviorSubject<Email[]> {
    switch(folder) {
      case 'inbox':
        return this.inboxEmailsSubject;
      case 'sent':
        return this.sentEmailsSubject;
      case 'draft':
        return this.draftEmailsSubject;
      case 'trash':
        return this.trashEmailsSubject;
      default:
        return this.inboxEmailsSubject;
    }
  }
}
