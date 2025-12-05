import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter, Trash2, FolderInput, X } from 'lucide-angular';
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
  readonly Trash2 = Trash2;
  readonly FolderInput = FolderInput;
  readonly X = X;

  allEmails: Email[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';
  selectedEmailId: string | null = null;

  // Selection properties
  selectedEmails: Set<string> = new Set();
  showActionBar: boolean = false;
  selectedFolder: string = 'inbox'; // Current folder
  moveToFolder: string = ''; // Target folder for move operation

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

  // ============== SELECTION METHODS ==============

  /**
   * Toggle individual email selection
   */
  toggleEmailSelection(event: Event, emailId: string): void {
    event.stopPropagation();

    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }

    this.updateActionBarVisibility();
  }

  /**
   * Check if email is selected
   */
  isEmailSelected(emailId: string): boolean {
    return this.selectedEmails.has(emailId);
  }

  /**
   * Select or deselect all emails
   */
  toggleSelectAll(): void {
    if (this.selectedEmails.size === this.paginatedEmails.length) {
      // Deselect all
      this.selectedEmails.clear();
    } else {
      // Select all
      this.paginatedEmails.forEach(email => {
        this.selectedEmails.add(email.id);
      });
    }

    this.updateActionBarVisibility();
  }

  /**
   * Check if all emails are selected
   */
  areAllSelected(): boolean {
    return this.paginatedEmails.length > 0 &&
      this.selectedEmails.size === this.paginatedEmails.length;
  }

  /**
   * Update action bar visibility based on selection
   */
  updateActionBarVisibility(): void {
    this.showActionBar = this.selectedEmails.size > 0;
  }

  /**
   * Get count of selected emails
   */
  getSelectedCount(): number {
    return this.selectedEmails.size;
  }

  /**
   * Close action bar and clear selection
   */
  closeActionBar(): void {
    this.selectedEmails.clear();
    this.showActionBar = false;
    this.moveToFolder = '';
  }

  // ============== ACTION METHODS ==============

  /**
   * Delete selected emails
   */
  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      this.mailService.deleteEmail(emailId, this.selectedFolder).subscribe({
        next: (response) => {
          successCount++;
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onDeleteComplete(successCount, selectedIds.length);
          }
        },
        error: (error) => {
          console.error(`Failed to delete email ${emailId}:`, error);
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onDeleteComplete(successCount, selectedIds.length);
          }
        }
      });
    });
  }

  /**
   * Handle delete completion
   */
  private onDeleteComplete(successCount: number, totalCount: number): void {
    if (successCount > 0) {
      // Refresh the email list
      this.mailService.refreshEmails().subscribe(() => {
        this.closeActionBar();
        alert(`${successCount} of ${totalCount} email(s) moved to trash`);
      });
    } else {
      alert('Failed to delete emails');
    }
  }

  /**
   * Move selected emails to another folder
   */
  moveSelectedEmails(): void {
    if (this.selectedEmails.size === 0 || !this.moveToFolder) {
      alert('Please select a folder');
      return;
    }

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      this.mailService.moveEmail(emailId, this.selectedFolder, this.moveToFolder).subscribe({
        next: (response) => {
          successCount++;
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onMoveComplete(successCount, selectedIds.length);
          }
        },
        error: (error) => {
          console.error(`Failed to move email ${emailId}:`, error);
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onMoveComplete(successCount, selectedIds.length);
          }
        }
      });
    });
  }

  /**
   * Handle move completion
   */
  private onMoveComplete(successCount: number, totalCount: number): void {
    if (successCount > 0) {
      // Refresh the email list
      this.mailService.refreshEmails().subscribe(() => {
        this.closeActionBar();
        alert(`${successCount} of ${totalCount} email(s) moved to ${this.moveToFolder}`);
      });
    } else {
      alert('Failed to move emails');
    }
  }

  /**
   * Handle folder selection change
   */
  onFolderChange(folder: string): void {
    this.moveToFolder = folder;
  }
}
