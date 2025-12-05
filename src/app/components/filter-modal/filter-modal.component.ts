// components/filter-modal/filter-modal.component.ts
// Simplified filter modal component

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterCriteria } from '../../core/models/FilterCriteria';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.css']
})
export class FilterModalComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<FilterCriteria>();

  // Filter form fields
  sender: string = '';
  hasAttachment: string = 'all';
  importance: string = 'all';
  dateFrom: string = '';
  dateTo: string = '';

  onClose(): void {
    this.close.emit();
  }

  onClearFilters(): void {
    this.sender = '';
    this.hasAttachment = 'all';
    this.importance = 'all';
    this.dateFrom = '';
    this.dateTo = '';
  }

  onApplyFilters(): void {
    const criteria: FilterCriteria = {};

    if (this.sender.trim()) {
      criteria.sender = this.sender.trim();
    }

    if (this.hasAttachment !== 'all') {
      criteria.hasAttachment = this.hasAttachment === 'yes';
    }

    if (this.importance !== 'all') {
      criteria.importance = this.importance as 'low' | 'normal' | 'high';
    }

    if (this.dateFrom) {
      criteria.dateFrom = new Date(this.dateFrom);
    }

    if (this.dateTo) {
      criteria.dateTo = new Date(this.dateTo);
    }

    this.applyFilters.emit(criteria);
    this.onClose();
  }
}