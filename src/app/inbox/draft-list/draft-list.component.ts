import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { EmailFilterService } from '../../core/services/email-filter.service';
import { Email } from '../../core/models/email.model';
import { SortCriteria } from '../../core/models/SortCriteria';
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter, Trash2, FolderInput, X } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { FilterModalComponent } from '../../components/filter-modal/filter-modal.component';




@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent,FilterModalComponent],
  templateUrl: './draft-list.component.html',
  styleUrl: './draft-list.component.css'
})
export class DraftListComponent implements OnInit{
  // Folder configuration - CHANGE THIS
  // Line 27-28
  folderName: string = 'draft';
  title: string = 'Drafts';

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

  // Email data
  allEmails: Email[] = [];
  filteredEmails: Email[] = [];
  selectedEmailId: string | null = null;

  // Search, Sort, Filter
  searchQuery: string = '';
  sortCriteria: SortCriteria = { field: 'date', direction: 'desc' };
  filterCriteria: FilterCriteria = {};
  hasActiveFilters: boolean = false;
  showFilterModal: boolean = false;

  // Selection properties for action bar
  selectedEmails: Set<string> = new Set();
  showActionBar: boolean = false;
  moveToFolder: string = '';

  constructor(
    private mailService: MailService,
    private emailStateService: EmailStateService,
    private emailFilterService: EmailFilterService
  ) {}

  ngOnInit(): void {
    this.loadEmails();

    // Track which email is selected
    this.emailStateService.selectedEmail$.subscribe(email => {
      this.selectedEmailId = email?.id || null;
    });
  }

  /**
   * Load emails for this folder
   */
  loadEmails(): void {
    this.mailService.refreshFolder(this.folderName).subscribe(emails => {
      this.allEmails = emails;
      this.applyFiltersAndSort();
    });
  }

  onEmailClick(email: Email): void {
    this.mailService.markAsRead(email.id);
    this.emailStateService.selectEmail(email);
  }

  toggleStar(event: Event, email: Email): void {
    event.stopPropagation();
    this.mailService.toggleStar(email.id, this.folderName);
  }

 /**
   * Apply filters and sorting
   */
  applyFiltersAndSort(): void {
    // Apply search as part of filter criteria
    const criteria: FilterCriteria = {
      ...this.filterCriteria,
      searchTerm: this.searchQuery
    };

    // Process emails through filter service
    this.filteredEmails = this.emailFilterService.processEmails(
      this.allEmails,
      criteria,
      this.sortCriteria
    );

    // Check if filters are active
    this.hasActiveFilters = this.emailFilterService.hasActiveFilters(criteria);

    // Update pagination
    this.totalItems = this.filteredEmails.length;
    this.updatePagination();
  }

  /**
   * Handle search input
   */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  /**
   * Handle sort change
   */
  onSortChange(value: string): void {
    const [field, direction] = value.split('-') as [SortCriteria['field'], SortCriteria['direction']];
    this.sortCriteria = { field, direction };
    this.applyFiltersAndSort();
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
   * Apply filters from modal
   */
  onApplyFilters(criteria: FilterCriteria): void {
    this.filterCriteria = criteria;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.filterCriteria = {};
    this.searchQuery = '';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  // ============== PAGINATION ==============

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
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

  // ============== ACTIONS ==============

  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;

    const confirmDelete = confirm(`Move ${this.selectedEmails.size} email(s) to trash?`);
    if (!confirmDelete) return;

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      this.mailService.deleteEmail(emailId, this.folderName).subscribe({
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
      this.mailService.moveEmail(emailId, this.folderName, this.moveToFolder).subscribe({
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
      this.loadEmails();
      this.closeActionBar();
      const message = action === 'moved'
        ? `${successCount} of ${totalCount} email(s) moved to ${this.moveToFolder}`
        : `${successCount} of ${totalCount} email(s) moved to trash`;
      alert(message);
    } else {
      alert(`Failed to ${action} emails`);
    }
  }
}
