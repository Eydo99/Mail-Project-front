import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailService } from '../../core/services/mail.service';
import { EmailStateService } from '../../core/services/email-state.service';
import { Email } from '../../core/models/email.model';
import { LucideAngularModule, Star, Paperclip, AlertCircle, Filter } from 'lucide-angular';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import{ SortCriteria} from '../../core/models/SortCriteria'
import { FilterCriteria } from '../../core/models/FilterCriteria';
import { EmailFilterService } from '../../core/services/email-filter.service';

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
  filteredEmails: Email[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';
  selectedEmailId: string | null = null;

  // ADD THESE - Sort
  sortField: SortCriteria['field'] = 'date';
  sortDirection: SortCriteria['direction'] = 'desc';
  
  // ADD THESE - Filter
  showFilterModal: boolean = false;
  activeFilters: FilterCriteria = {};
  hasActiveFilters: boolean = false;
  

  constructor(
    private mailService: MailService,
    private emailStateService: EmailStateService,
    private emailFilterService: EmailFilterService // ADD THIS
  ) {}

  ngOnInit(): void {
    this.mailService.getEmails().subscribe(emails => {
      this.allEmails = emails;
      this.totalItems = emails.length;
      this.applyFiltersAndSort();
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
    this.paginatedEmails = this.filteredEmails.slice(start, end); // CHANGE from allEmails to filteredEmails
  }
}
