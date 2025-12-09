// folder-view.component.ts - Modified for backend
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MailService } from '../../core/services/mail.service';
import { FolderService } from '../../core/services/folder.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { EmailFilterService } from '../../core/services/email-filter.service';
import { Email } from '../../core/models/email.model';
import { SortCriteria } from '../../core/models/SortCriteria';
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter, Trash2, FolderInput, X, Edit, ArrowLeft } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent],
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent implements OnInit {
  folderId: string = '';
  folderName: string = '';
  folderDescription: string = '';
  folderColor: string = '#3b82f6';

  // Pagination
  paginatedEmails: Email[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Icons
  readonly Star = Star;
  readonly Paperclip = Paperclip;
  readonly AlertCircle = AlertCircle;
  readonly Filter = Filter;
  readonly Trash2 = Trash2;
  readonly FolderInput = FolderInput;
  readonly X = X;
  readonly Edit = Edit;
  readonly ArrowLeft = ArrowLeft;

  allEmails: Email[] = [];
  filteredEmails: Email[] = [];
  searchQuery: string = '';
  selectedEmailId: string | null = null;

  // Sort & Filter
  sortField: SortCriteria['field'] = 'date';
  sortDirection: SortCriteria['direction'] = 'desc';
  showFilterModal: boolean = false;
  activeFilters: FilterCriteria = {};

  // Selection
  selectedEmails: Set<string> = new Set();
  showActionBar: boolean = false;
  moveToFolder: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mailService: MailService, // Existing mail service
    private folderService: FolderService, // New folder service
    private emailStateService: EmailStateService,
    private emailFilterService: EmailFilterService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.folderId = params['id'];
      this.loadFolderDetails();
      this.loadEmails();
    });

    this.emailStateService.selectedEmail$.subscribe(email => {
      this.selectedEmailId = email?.id || null;
    });
  }

  /**
   * Load folder metadata from backend using FolderService
   */
  loadFolderDetails(): void {
    this.folderService.getFolderById(this.folderId).subscribe({
      next: (folder) => {
        if (folder) {
          this.folderName = folder.name;
          this.folderDescription = folder.description || '';
          this.folderColor = folder.color;
        }
      },
      error: (error) => {
        console.error('Error loading folder details:', error);
        alert('Failed to load folder details');
      }
    });
  }

  /**
   * Load emails from backend for this folder using FolderService
   */
  loadEmails(): void {
    this.folderService.getEmailsByFolder(this.folderId).subscribe({
      next: (emails) => {
        this.allEmails = emails;
        this.applyFiltersAndSort();
      },
      error: (error) => {
        console.error('Error loading emails:', error);
        alert('Failed to load emails');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/folders']);
  }

  editFolder(): void {
    this.router.navigate(['/folders'], { queryParams: { edit: this.folderId } });
  }

  onEmailClick(email: Email): void {
    // Use FolderService for marking as read (no folder parameter needed)
    this.folderService.markAsRead(email.id).subscribe();
    this.emailStateService.selectEmail(email,this.filteredEmails);
  }

  toggleStar(event: Event, email: Email): void {
    event.stopPropagation();
    // Use FolderService with folder ID
    this.folderService.toggleStar(email.id, this.folderId).subscribe({
      next: () => {
        email.isStarred = !email.isStarred;
      },
      error: (error) => {
        console.error('Error toggling star:', error);
      }
    });
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

  // Pagination
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

  // Selection
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
      this.paginatedEmails.forEach(email => this.selectedEmails.add(email.id));
    }
    this.updateActionBarVisibility();
  }

  areAllSelected(): boolean {
    return this.paginatedEmails.length > 0 && 
           this.paginatedEmails.every(email => this.selectedEmails.has(email.id));
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

  // Actions - Use FolderService instead of MailService
  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;
    
    const confirmed = confirm(`Move ${this.selectedEmails.size} email(s) to trash?`);
    if (!confirmed) return;

    const selectedIds = Array.from(this.selectedEmails);
    
    // Use FolderService for bulk delete
    this.folderService.bulkDeleteFromFolder(selectedIds, this.folderId).subscribe({
      next: () => {
        alert(`${selectedIds.length} email(s) moved to trash`);
        this.loadEmails(); // Reload emails from backend
        this.closeActionBar();
      },
      error: (error) => {
        console.error('Error deleting emails:', error);
        alert('Failed to delete emails');
      }
    });
  }

  moveSelectedEmails(): void {
    if (this.selectedEmails.size === 0 || !this.moveToFolder) return;
    
    const selectedIds = Array.from(this.selectedEmails);
    
    // Use FolderService for bulk move
    this.folderService.bulkMoveToFolder(selectedIds, `folder_${this.folderId}`, this.moveToFolder).subscribe({
      next: () => {
        alert(`${selectedIds.length} email(s) moved successfully`);
        this.loadEmails(); // Reload emails from backend
        this.closeActionBar();
      },
      error: (error) => {
        console.error('Error moving emails:', error);
        alert('Failed to move emails');
      }
    });
  }
}