import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LucideAngularModule, Star, Paperclip, Filter, Trash2, FolderInput, X } from 'lucide-angular';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { SortCriteria } from '../../core/models/SortCriteria';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { FilterModalComponent } from "../../components/filter-modal/filter-modal.component";
import { FolderData } from "../../components/folder-modal/folder-modal.component";
import { FolderService } from "../../core/services/folder.service";

@Component({
  selector: 'app-starred-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent, FilterModalComponent],
  templateUrl: './starred-list.component.html',
  styleUrls: ['./starred-list.component.css']
})
export class StarredListComponent implements OnInit, OnDestroy {
  // Folder configuration
  folderName: string = 'starred';
  title: string = '⭐ Starred';

  // Pagination
  paginatedEmails: Email[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Icons
  readonly Star = Star;
  readonly Paperclip = Paperclip;
  readonly Filter = Filter;
  readonly Trash2 = Trash2;
  readonly FolderInput = FolderInput;
  readonly X = X;

  // Email data (comes from backend, already filtered and sorted)
  allEmails: Email[] = [];
  filteredEmails: Email[] = [];
  selectedEmailId: string | null = null;

  // Search, Sort, Filter
  searchQuery: string = '';
  sortCriteria: SortCriteria = { field: 'date', direction: 'desc' };
  filterCriteria: FilterCriteria = {};
  hasActiveFilters: boolean = false;
  showFilterModal: boolean = false;

  // Selection for action bar
  selectedEmails: Set<string> = new Set();
  showActionBar: boolean = false;
  moveToFolder: string = '';

  folders: FolderData[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private mailService: MailService,
    private emailStateService: EmailStateService,
    private folderService: FolderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmails();
    this.loadFolders();

    // Track selected email
    this.emailStateService.selectedEmail$
      .pipe(takeUntil(this.destroy$))
      .subscribe(email => {
        this.selectedEmailId = email?.id || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFolders(): void {
    this.folderService.getAllFolders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(folders => {
        this.folders = folders;
      });
  }

  /**
   * Load starred emails - Uses backend filtering and sorting via mailService.refreshFolder
   * The backend getStarredEmails() method applies filters and sorting before returning results
   */
  loadEmails(): void {
    // Build sort string for backend (e.g., "date-desc", "subject-asc")
    const sortString = `${this.sortCriteria.field}-${this.sortCriteria.direction}`;

    // Convert frontend filters to backend format
    const backendFilters = this.buildBackendFilters();

    console.log('🔄 Loading starred emails with:', { sortString, backendFilters });

    // Call mailService.refreshFolder which hits the backend endpoint
    // Backend applies filters and sorting via EmailFilterService and EmailSortContext
    this.mailService.refreshFolder(this.folderName, sortString, backendFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (emails) => {
          // Backend already filtered and sorted - just use the results
          this.allEmails = emails;
          this.filteredEmails = emails;
          this.totalItems = emails.length;
          this.updatePagination();
          console.log(`✅ Loaded ${emails.length} starred emails`);
        },
        error: (error) => {
          console.error('❌ Error loading starred emails:', error);
          this.allEmails = [];
          this.filteredEmails = [];
          this.totalItems = 0;
          this.updatePagination();
        }
      });
  }

  /**
   * Convert frontend FilterCriteria to backend FilterCriteriaDTO format
   */
  private buildBackendFilters(): any {
    const filters: any = {};

    // Search term (searches across subject, body, sender)
    if (this.searchQuery && this.searchQuery.trim()) {
      filters.searchTerm = this.searchQuery.trim();
    }

    // Date range filters
    if (this.filterCriteria.dateFrom) {
      filters.dateFrom = this.filterCriteria.dateFrom;
    }

    if (this.filterCriteria.dateTo) {
      filters.dateTo = this.filterCriteria.dateTo;
    }

    // Sender filter
    if (this.filterCriteria.sender) {
      filters.sender = this.filterCriteria.sender;
    }

    // Priority filter (array of priority levels)
    if (this.filterCriteria.priority && this.filterCriteria.priority.length > 0) {
      filters.priority = this.filterCriteria.priority;
    }

    // Attachment filter
    if (this.filterCriteria.hasAttachment !== undefined) {
      filters.hasAttachment = this.filterCriteria.hasAttachment;
    }

    // Subject contains
    if (this.filterCriteria.subjectContains) {
      filters.subjectContains = this.filterCriteria.subjectContains;
    }

    // Body contains
    if (this.filterCriteria.bodyContains) {
      filters.bodyContains = this.filterCriteria.bodyContains;
    }

    // Update UI flag for active filters
    this.hasActiveFilters = Object.keys(filters).length > 0;

    // Return undefined if no filters to avoid sending empty object
    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  /**
   * Handle search input - triggers backend reload with search term
   */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1; // Reset to first page on new search
    this.loadEmails(); // Backend handles search filtering
  }

  /**
   * Handle sort change - triggers backend reload with new sort
   */
  onSortChange(value: string): void {
    const [field, direction] = value.split('-') as [SortCriteria['field'], SortCriteria['direction']];
    this.sortCriteria = { field, direction };
    this.currentPage = 1; // Reset to first page on sort change
    this.loadEmails(); // Backend handles sorting via EmailSortContext
  }

  /**
   * Open filter modal
   */
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  /**
   * Close filter modal
   */
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  /**
   * Apply filters from modal - triggers backend reload with filters
   */
  onApplyFilters(criteria: FilterCriteria): void {
    console.log('📋 Applying filters:', criteria);
    this.filterCriteria = criteria;
    this.currentPage = 1; // Reset to first page on filter change
    this.loadEmails(); // Backend handles filtering via EmailFilterService
  }

  /**
   * Clear all filters - reloads from backend without filters
   */
  clearAllFilters(): void {
    console.log('🗑️ Clearing all filters');
    this.filterCriteria = {};
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadEmails(); // Reload from backend without any filters
  }

  /**
   * Email click handler
   */
  onEmailClick(email: Email): void {
    this.mailService.markAsRead(email.id);
    this.emailStateService.selectEmail(email, this.filteredEmails);
  }

  /**
   * Toggle star (unstar) - SIMPLIFIED VERSION
   * No need for manual refresh - service handles it
   */
  toggleStar(event: Event, email: Email): void {
    event.stopPropagation();

    // Use the original folder stored in the email object
    const originalFolder = email.folder || 'inbox'; // fallback to inbox if not set

    console.log(`⭐ Toggling star for email ${email.id} in original folder: ${originalFolder}`);

    this.mailService.toggleStar(email.id, originalFolder).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        console.log(`✅ Successfully toggled star for email ${email.id}`);
        // Service automatically refreshes both folders - no manual refresh needed
      },
      error: (error) => {
        console.error('❌ Error toggling star:', error);
        alert('Failed to toggle star. Please try again.');
      }
    });
  }

  /**
   * Get the original folder where the email exists
   * Starred emails can come from inbox, sent, draft, or custom folders
   */
  private getOriginalFolder(email: Email): string {
    // Check if email has a folder property (added by backend)
    if (email.folder) {
      return email.folder;
    }

    // Fallback: try to determine from email properties
    // If email has 'to' field and no 'from' matching current user, it's likely inbox
    // If email has 'from' matching current user, it's likely sent
    // This is a best guess and might not always be accurate

    // For now, default to 'inbox' as most starred emails are from inbox
    // You should update your backend to include the folder property in starred emails
    console.warn(`Email ${email.id} missing folder property, defaulting to 'inbox'`);
    return 'inbox';
  }

  // ============== PAGINATION ==============

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page when changing items per page
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEmails = this.filteredEmails.slice(start, end);
  }

  // ============== SELECTION & ACTION BAR ==============

  toggleEmailSelection(event: Event, emailId: string): void {
    event.stopPropagation();

    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }

    this.updateActionBarVisibility();
  }

  isEmailSelected(emailId: string): boolean {
    return this.selectedEmails.has(emailId);
  }

  toggleSelectAll(): void {
    if (this.areAllSelected()) {
      this.selectedEmails.clear();
    } else {
      this.paginatedEmails.forEach(email => {
        this.selectedEmails.add(email.id);
      });
    }

    this.updateActionBarVisibility();
  }

  areAllSelected(): boolean {
    return this.paginatedEmails.length > 0 &&
      this.selectedEmails.size === this.paginatedEmails.length;
  }

  updateActionBarVisibility(): void {
    this.showActionBar = this.selectedEmails.size > 0;
  }

  getSelectedCount(): number {
    return this.selectedEmails.size;
  }

  closeActionBar(): void {
    this.selectedEmails.clear();
    this.showActionBar = false;
    this.moveToFolder = '';
  }

  onFolderChange(folder: string): void {
    this.moveToFolder = folder;
  }

  // ============== BULK ACTIONS ==============

  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;

    const confirmDelete = confirm(`Move ${this.selectedEmails.size} email(s) to trash?`);
    if (!confirmDelete) return;

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      // Find the email to get its original folder
      const email = this.allEmails.find(e => e.id === emailId);
      const originalFolder = email ? this.getOriginalFolder(email) : 'inbox';

      this.mailService.deleteEmail(emailId, originalFolder)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            successCount++;
            completedRequests++;

            if (completedRequests === selectedIds.length) {
              this.onActionComplete(successCount, selectedIds.length, 'deleted');
            }
          },
          error: (error) => {
            console.error(`Failed to delete email ${emailId}:`, error);
            completedRequests++;

            if (completedRequests === selectedIds.length) {
              this.onActionComplete(successCount, selectedIds.length, 'deleted');
            }
          }
        });
    });
  }

  moveSelectedEmails(): void {
    if (this.selectedEmails.size === 0 || !this.moveToFolder) {
      alert('Please select a folder');
      return;
    }

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      // Find the email to get its original folder
      const email = this.allEmails.find(e => e.id === emailId);
      const originalFolder = email ? this.getOriginalFolder(email) : 'inbox';

      this.mailService.moveEmail(emailId, originalFolder, this.moveToFolder)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            successCount++;
            completedRequests++;

            if (completedRequests === selectedIds.length) {
              this.onActionComplete(successCount, selectedIds.length, 'moved');
            }
          },
          error: (error) => {
            console.error(`Failed to move email ${emailId}:`, error);
            completedRequests++;

            if (completedRequests === selectedIds.length) {
              this.onActionComplete(successCount, selectedIds.length, 'moved');
            }
          }
        });
    });
  }

  private onActionComplete(successCount: number, totalCount: number, action: string): void {
    if (successCount > 0) {
      this.loadEmails(); // Reload emails after bulk action
      this.closeActionBar();
      const message = action === 'moved'
        ? `${successCount} of ${totalCount} email(s) moved to ${this.moveToFolder}`
        : `${successCount} of ${totalCount} email(s) moved to trash`;
      alert(message);
    } else {
      alert(`Failed to ${action} emails`);
    }
  }

  // ============== UTILITY METHODS ==============

  getPriorityColor(priority: number): string {
    switch(priority) {
      case 1: return '#dc2626'; // Red - Urgent
      case 2: return '#ea580c'; // Orange - High
      case 3: return '#ca8a04'; // Yellow - Medium
      case 4: return '#65a30d'; // Green - Low
      default: return '#9ca3af'; // Gray - Default
    }
  }
}
