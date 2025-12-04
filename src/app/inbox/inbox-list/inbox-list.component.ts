import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter } from 'lucide-angular';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './inbox-list.component.html',
  styleUrl: './inbox-list.component.css'
})
export class InboxListComponent implements OnInit {
  // Export icons for template
  readonly Star = Star;
  readonly Paperclip = Paperclip;
  readonly AlertCircle = AlertCircle;
  readonly Filter = Filter;

  emails: Email[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';
  selectedEmailId: string | null = null;

  constructor(
    private mailService: MailService,
    private emailStateService: EmailStateService
  ) {}

  ngOnInit(): void {
    this.mailService.getEmails().subscribe(emails => {
      this.emails = emails;
    });

    // Track which email is selected
    this.emailStateService.selectedEmail$.subscribe(email => {
      this.selectedEmailId = email?.id || null;
    });
  }

  onEmailClick(email: Email): void {
    this.mailService.markAsRead(email.id);
    this.emailStateService.selectEmail(email);
  }

  toggleStar(event: Event, email: Email): void {
    event.stopPropagation();
    this.mailService.toggleStar(email.id);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    // TODO: Implement search filtering
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    // TODO: Implement sorting
  }
}
