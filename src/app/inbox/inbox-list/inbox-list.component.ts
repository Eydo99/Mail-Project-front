import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PaginationComponent],
  templateUrl: './inbox-list.component.html',
  styleUrl: './inbox-list.component.css'
})
export class InboxListComponent implements OnInit {

  // Pagination properties
  paginatedEmails: Email[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Export icons for template
  readonly Star = Star;
  readonly Paperclip = Paperclip;
  readonly AlertCircle = AlertCircle;
  readonly Filter = Filter;

  allEmails: Email[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';
  selectedEmailId: string | null = null;

  constructor(
    private mailService: MailService,
    private emailStateService: EmailStateService
  ) {}

  ngOnInit(): void {
    this.mailService.getEmails().subscribe(emails => {
      this.allEmails = emails;
      this.totalItems = emails.length;
      this.updatePagination();
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
    // After implementing search, call this.updatePagination()
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    // TODO: Implement sorting
    // After implementing sort, call this.updatePagination()
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEmails = this.allEmails.slice(start, end);
  }
}
