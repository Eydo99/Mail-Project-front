// folder-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter, Trash2, FolderInput, X, Edit, ArrowLeft } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { SortCriteria } from '../../core/models/SortCriteria';
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { EmailFilterService } from '../../core/services/email-filter.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent],
  template: `
    <div class="inbox-container">
      <!-- Action Bar -->
      <div class="action-bar" *ngIf="showActionBar">
        <div class="action-bar-content">
          <div class="action-bar-left">
            <span class="selection-count">{{ getSelectedCount() }} email{{ getSelectedCount() > 1 ? 's' : '' }} selected</span>
          </div>

          <div class="action-bar-center">
            <button class="action-btn delete-btn" (click)="deleteSelectedEmails()">
              <lucide-icon [img]="Trash2" class="action-icon"></lucide-icon>
              Delete
            </button>

            <select class="folder-dropdown" [(ngModel)]="moveToFolder" (change)="onFolderChange(moveToFolder)">
              <option value="" disabled selected>Choose folder...</option>
              <option value="inbox">Inbox</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
              <option value="trash">Trash</option>
            </select>

            <button class="action-btn move-btn" (click)="moveSelectedEmails()" [disabled]="!moveToFolder">
              <lucide-icon [img]="FolderInput" class="action-icon"></lucide-icon>
              Move
            </button>
          </div>

          <button class="action-bar-close" (click)="closeActionBar()">
            <lucide-icon [img]="X" class="close-icon"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Header -->
      <div class="inbox-header">
        <div class="header-top">
          <button class="back-btn" (click)="goBack()">
            <lucide-icon [img]="ArrowLeft" class="back-icon"></lucide-icon>
          </button>
          <h1 class="inbox-title" [style.color]="folderColor">{{ folderName }}</h1>
          <button class="edit-folder-btn" (click)="editFolder()" title="Edit folder">
            <lucide-icon [img]="Edit" class="edit-icon"></lucide-icon>
          </button>
        </div>
        
        <p class="folder-description" *ngIf="folderDescription">{{ folderDescription }}</p>

        <div class="inbox-toolbar">
          <button class="select-all-btn" (click)="toggleSelectAll()">
            {{ areAllSelected() ? 'Deselect All' : 'Select All' }}
          </button>

          <input
            type="text"
            class="search-bar"
            placeholder="Search emails..."
            [(ngModel)]="searchQuery"
            (input)="onSearch(searchQuery)"
          />

          <select class="sort-dropdown" (change)="onSortChange($any($event.target).value)">
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="sender-asc">Sender (A-Z)</option>
            <option value="sender-desc">Sender (Z-A)</option>
            <option value="subject-asc">Subject (A-Z)</option>
            <option value="subject-desc">Subject (Z-A)</option>
          </select>

          <button class="filters-btn" (click)="openFilterModal()">
            <lucide-icon [img]="Filter" class="filter-icon"></lucide-icon>
            <span>Filters</span>
          </button>
        </div>
      </div>

      <!-- Email List -->
      <div class="email-list">
        <div
          *ngFor="let email of paginatedEmails"
          class="email-item"
          [class.selected]="email.id === selectedEmailId"
          [class.checkbox-selected]="isEmailSelected(email.id)"
          (click)="onEmailClick(email)"
        >
          <input
            type="checkbox"
            class="email-checkbox"
            [checked]="isEmailSelected(email.id)"
            (click)="toggleEmailSelection($event, email.id)"
          />

          <div class="email-content">
            <div class="email-header">
              <span class="email-sender">{{ email.sender }}</span>

              <lucide-icon
                [img]="Star"
                [class.starred]="email.isStarred"
                class="icon star-icon"
                (click)="toggleStar($event, email)"
              ></lucide-icon>

              <lucide-icon
                *ngIf="email.hasAttachment"
                [img]="Paperclip"
                class="icon attachment-icon"
              ></lucide-icon>

              <lucide-icon
                *ngIf="email.priority <= 2"
                [img]="AlertCircle"
                class="icon urgent-icon"
              ></lucide-icon>
            </div>

            <div class="email-subject">{{ email.subject }}</div>
            <div class="email-preview">{{ email.preview }}</div>
          </div>

          <div class="email-time">
            {{ email.timestamp | date:'shortTime' }}
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="paginatedEmails.length === 0" class="empty-state">
          <lucide-icon [img]="FolderInput" class="empty-icon"></lucide-icon>
          <p class="empty-message">No emails in this folder</p>
          <p class="empty-hint">Emails you move here will appear in this folder</p>
        </div>
      </div>

      <!-- Pagination -->
      <app-pagination
        [currentPage]="currentPage"
        [totalItems]="totalItems"
        [itemsPerPage]="itemsPerPage"
        (pageChange)="onPageChange($event)"
        (itemsPerPageChange)="onItemsPerPageChange($event)"
      ></app-pagination>
    </div>
  `,
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
    private mailService: MailService,
    private emailStateService: EmailStateService,
    private emailFilterService: EmailFilterService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.folderId = params['id'];
    //  this.loadFolderDetails();
      //this.loadEmails();
    });

    this.emailStateService.selectedEmail$.subscribe(email => {
      this.selectedEmailId = email?.id || null;
    });
  }

  //loadFolderDetails(): void {
    // Load folder metadata from service
    //this.mailService.getFolderById(this.folderId).subscribe(folder => {
      //if (folder) {
        //this.folderName = folder.name;
        //this.folderDescription = folder.description || '';
        //this.folderColor = folder.color;
      //}
    //});
  //}

  //loadEmails(): void {
    //this.mailService.getEmailsByFolder(this.folderId).subscribe(emails => {
      //this.allEmails = emails;
      //this.applyFiltersAndSort();
    //});
  //}

  goBack(): void {
    this.router.navigate(['/inbox']);
  }

  editFolder(): void {
    // Navigate to folder management or open edit modal
    this.router.navigate(['/folders'], { queryParams: { edit: this.folderId } });
  }

  onEmailClick(email: Email): void {
    this.mailService.markAsRead(email.id);
    this.emailStateService.selectEmail(email);
  }

  toggleStar(event: Event, email: Email): void {
    event.stopPropagation();
    this.mailService.toggleStar(email.id, this.folderId);
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
    return this.paginatedEmails.length > 0 && this.selectedEmails.size === this.paginatedEmails.length;
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

  // Actions
  deleteSelectedEmails(): void {
    if (this.selectedEmails.size === 0) return;
    const confirmed = confirm(`Move ${this.selectedEmails.size} email(s) to trash?`);
    if (!confirmed) return;

    const selectedIds = Array.from(this.selectedEmails);
    this.performBatchAction(selectedIds, 'delete');
  }

  moveSelectedEmails(): void {
    if (this.selectedEmails.size === 0 || !this.moveToFolder) return;
    const selectedIds = Array.from(this.selectedEmails);
    this.performBatchAction(selectedIds, 'move', this.moveToFolder);
  }

  private performBatchAction(emailIds: string[], action: string, targetFolder?: string): void {
    let completed = 0;
    let success = 0;

    emailIds.forEach(id => {
      const observable = action === 'delete'
        ? this.mailService.deleteEmail(id, this.folderId)
        : this.mailService.moveEmail(id, this.folderId, targetFolder!);

      observable.subscribe({
        next: () => {
          success++;
          completed++;
          if (completed === emailIds.length) {
            this.onActionComplete(success, emailIds.length, action);
          }
        },
        error: () => {
          completed++;
          if (completed === emailIds.length) {
            this.onActionComplete(success, emailIds.length, action);
          }
        }
      });
    });
  }

  private onActionComplete(success: number, total: number, action: string): void {
    if (success > 0) {
     // this.loadEmails();
      this.closeActionBar();
      alert(`${success} of ${total} email(s) ${action === 'delete' ? 'deleted' : 'moved'}`);
    }
  }
}