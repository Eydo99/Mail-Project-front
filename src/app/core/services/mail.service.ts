import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = 'http://localhost:8080/api/mail';

  private emailsSubject = new BehaviorSubject<Email[]>([]);
  public emails$: Observable<Email[]> = this.emailsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInboxEmails();
  }

  /**
   * Load inbox emails from backend
   */
  private loadInboxEmails(): void {
    this.http.get<any[]>(`${this.apiUrl}/inbox`).subscribe({
      next: (emails) => {
        const mappedEmails = this.mapBackendToFrontend(emails);
        this.emailsSubject.next(mappedEmails);
      },
      error: (error) => {
        console.error('Error loading emails:', error);
      }
    });
  }

  /**
   * Map backend DTO to frontend Email model
   */
  private mapBackendToFrontend(backendEmails: any[]): Email[] {
    return backendEmails.map(email => ({
      id: email.id.toString(),
      sender: this.extractSenderName(email.to),
      senderEmail: email.to[0] || 'unknown@mail.com',
      subject: email.subject,
      preview: email.preview,
      body: email.body,
      timestamp: email.timestamp, // Keep as string, Angular will handle it in template
      isStarred: email.starred,
      hasAttachment: email.hasAttachment,
      priority: email.priority
    }));
  }

  /**
   * Extract sender name from email
   */
  private extractSenderName(recipients: string[]): string {
    if (!recipients || recipients.length === 0) return 'Unknown';
    const email = recipients[0];
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Get all emails (returns observable)
   */
  getEmails(): Observable<Email[]> {
    return this.emails$;
  }

  /**
   * Refresh emails from backend
   */
  refreshEmails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox`).pipe(
      tap(emails => {
        const mappedEmails = this.mapBackendToFrontend(emails);
        this.emailsSubject.next(mappedEmails);
      })
    );
  }

  /**
   * Get inbox emails
   */
  getInboxEmails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox`);
  }

  /**
   * Get sent emails
   */
  getSentEmails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sent`);
  }

  /**
   * Get draft emails
   */
  getDraftEmails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/draft`);
  }

  /**
   * Get trash emails
   */
  getTrashEmails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trash`);
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
  toggleStar(emailId: string): void {
    const emails = this.emailsSubject.value;
    const email = emails.find(e => e.id === emailId);

    if (email) {
      // Optimistic update
      email.isStarred = !email.isStarred;
      this.emailsSubject.next([...emails]);

      // Call backend
      this.http.put(`${this.apiUrl}/${emailId}/star?folder=inbox`, {}).subscribe({
        error: (error) => {
          // Revert on error
          email.isStarred = !email.isStarred;
          this.emailsSubject.next([...emails]);
          console.error('Error toggling star:', error);
        }
      });
    }
  }

  /**
   * Mark email as read
   */
  markAsRead(emailId: string): void {
    // This can be implemented when you add isRead field to your backend
    const emails = this.emailsSubject.value;
    const email = emails.find(e => e.id === emailId);
    if (email) {
      this.emailsSubject.next([...emails]);
    }
  }

  /**
   * Compose/send a new email
   */
  composeMail(email: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/compose`, email);
  }

  /**
   * Delete an email
   */
  deleteEmail(emailId: string, folder: string): Observable<string> {
    console.log(`${this.apiUrl}/${emailId}/${folder}`);
    return this.http.delete<string>(`${this.apiUrl}/${emailId}?folder=${folder}`);
  }

  /**
   * Move email to another folder
   */
  moveEmail(emailId: string, fromFolder: string, toFolder: string): Observable<string> {
    return this.http.put<string>(
      `${this.apiUrl}/${emailId}/move?fromFolder=${fromFolder}&toFolder=${toFolder}`,
      {}
    );
  }


}
