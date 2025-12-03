import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private mockEmails: Email[] = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      senderEmail: 'sarah.johnson@company.com',
      subject: 'Q4 Report Review',
      preview: 'Please review the attached Q4 financial report and provide your feedback by EOD...',
      timestamp: new Date('2024-12-03T10:30:00'),
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      isUrgent: false
    },
    {
      id: '2',
      sender: 'Team Notifications',
      senderEmail: 'team@notifications.com',
      subject: 'Weekly Team Update',
      preview: 'Here are this week\'s highlights and upcoming milestones for the project...',
      timestamp: new Date('2024-12-03T09:15:00'),
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      isUrgent: false
    },
    {
      id: '3',
      sender: 'Client Business',
      senderEmail: 'client@business.com',
      subject: 'Project Proposal Discussion',
      preview: 'I\'d like to schedule a meeting to discuss the new project proposal...',
      timestamp: new Date('2024-12-02T14:20:00'),
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      isUrgent: true
    },
    {
      id: '4',
      sender: 'HR Department',
      senderEmail: 'hr@company.com',
      subject: 'Benefits Enrollment Reminder',
      preview: 'Don\'t forget to complete your benefits enrollment by the end of this month...',
      timestamp: new Date('2024-12-02T11:45:00'),
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      isUrgent: false
    }
  ];

  private emailsSubject = new BehaviorSubject<Email[]>(this.mockEmails);
  public emails$: Observable<Email[]> = this.emailsSubject.asObservable();

  getEmails(): Observable<Email[]> {
    return this.emails$;
  }

  toggleStar(emailId: string): void {
    const emails = this.emailsSubject.value;
    const email = emails.find(e => e.id === emailId);
    if (email) {
      email.isStarred = !email.isStarred;
      this.emailsSubject.next([...emails]);
    }
  }

  markAsRead(emailId: string): void {
    const emails = this.emailsSubject.value;
    const email = emails.find(e => e.id === emailId);
    if (email) {
      email.isRead = true;
      this.emailsSubject.next([...emails]);
    }
  }
}
