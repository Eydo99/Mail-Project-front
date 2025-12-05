import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter, Trash2, FolderInput, X } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { SortCriteria } from '../../core/models/SortCriteria';
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { EmailFilterService } from '../../core/services/email-filter.service';

@Component({
  selector: 'app-trash-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent],
  templateUrl: './trash-list.component.html',
  styleUrl: './trash-list.component.css'
})
export class TrashListComponent implements OnInit {
  // Folder configuration
  folderName: string = 'trash';
  title: string = 'Trash';

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
  filteredEmails: Email[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';
  selectedEmailId: string | null = null;

  // Sort
  sortField: SortCriteria['field'] = 'date';
  sortDirection: SortCriteria['direction'] = 'desc';

  // Filter
  showFilterModal: boolean = false;
  activeFilters: FilterCriteria = {};
  hasActiveFilters: boolean = false;

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

  onSearch(query: string): void {
    this.searchQuery = query;
    this.activeFilters.searchTerm = query;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSortChange(value: string): void {
    const [field, direction] = value.split('-') as [SortCriteria['field'], SortCriteria['direction']];
    this.sortField = field;
    this.sortDirection = direction;
    this.applyFiltersAndSort();
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  onApplyFilters(criteria: FilterCriteria): void {
    this.activeFilters = { ...this.activeFilters, ...criteria };
    this.hasActiveFilters = Object.keys(criteria).filter(key => key !== 'searchTerm').length > 0;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  clearAllFilters(): void {
    this.activeFilters = {};
    this.searchQuery = '';
    this.hasActiveFilters = false;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    const sortCriteria: SortCriteria = {
      field: this.sortField,
      direction: this.sortDirection
    };

    this.filteredEmails = this.emailFilterService.processEmails(
      this.allEmails,
      this.activeFilters,
      sortCriteria
    );

    this.totalItems = this.filteredEmails.length;
    this.updatePagination();
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

  // ============== ACTIONS (Trash-specific) ==============

  /**
   * Permanently delete selected emails from trash
   */
  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;

    const confirmDelete = confirm(`Permanently delete ${this.selectedEmails.size} email(s)? This cannot be undone.`);
    if (!confirmDelete) return;

    const selectedIds = Array.from(this.selectedEmails);
    let completedRequests = 0;
    let successCount = 0;

    selectedIds.forEach(emailId => {
      this.mailService.deleteEmail(emailId, 'trash').subscribe({
        next: () => {
          successCount++;
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onActionComplete(successCount, selectedIds.length, 'permanently deleted');
          }
        },
        error: (error) => {
          console.error(`Failed to delete email ${emailId}:`, error);
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onActionComplete(successCount, selectedIds.length, 'permanently deleted');
          }
        }
      });
    });
  }

  /**
   * Restore (move) selected emails from trash
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
      this.mailService.moveEmail(emailId, 'trash', this.moveToFolder).subscribe({
        next: () => {
          successCount++;
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onActionComplete(successCount, selectedIds.length, 'restored');
          }
        },
        error: (error) => {
          console.error(`Failed to restore email ${emailId}:`, error);
          completedRequests++;

          if (completedRequests === selectedIds.length) {
            this.onActionComplete(successCount, selectedIds.length, 'restored');
          }
        }
      });
    });
  }

  private onActionComplete(successCount: number, totalCount: number, action: string): void {
    if (successCount > 0) {
      this.loadEmails();
      this.closeActionBar();
      const message = action === 'restored'
        ? `${successCount} of ${totalCount} email(s) restored to ${this.moveToFolder}`
        : `${successCount} of ${totalCount} email(s) ${action}`;
      alert(message);
    } else {
      alert(`Failed to ${action} emails`);
    }
  }
}
