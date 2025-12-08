// core/services/email-filter.service.ts

import { Injectable } from '@angular/core';
import { Email } from '../models/email.model';
import { FilterCriteria } from '../models/FilterCriteria';
import { SortCriteria } from '../models/SortCriteria';

/**
 * Chain of Responsibility Pattern for Email Filtering
 * Each filter is a link in the chain
 */
@Injectable({
  providedIn: 'root'
})
export class EmailFilterService {

  constructor() {}

  /**
   * Apply all filters and sorting to emails
   */
  processEmails(
    emails: Email[],
    filters: FilterCriteria,
    sort?: SortCriteria
  ): Email[] {
    let filtered = [...emails]; // Create copy to avoid mutation

    // Apply each filter in chain
    filtered = this.applySearchFilter(filtered, filters.searchTerm);
    filtered = this.applyDateRangeFilter(filtered, filters.dateFrom, filters.dateTo);
    filtered = this.applySenderFilter(filtered, filters.sender);
    filtered = this.applyPriorityFilter(filtered, filters.priority);
    filtered = this.applyAttachmentFilter(filtered, filters.hasAttachment);
    filtered = this.applyStarredFilter(filtered, filters.isStarred);
    filtered = this.applySubjectFilter(filtered, filters.subjectContains);
    filtered = this.applyBodyFilter(filtered, filters.bodyContains);

    // Apply sorting if provided
    if (sort) {
      filtered = this.applySorting(filtered, sort);
    }

    return filtered;
  }

  /**
   * Search in subject, body, sender, and senderEmail
   */
  private applySearchFilter(emails: Email[], searchTerm?: string): Email[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return emails;
    }

    const term = searchTerm.toLowerCase().trim();
    return emails.filter(email =>
      email.subject?.toLowerCase().includes(term) ||
      email.body?.toLowerCase().includes(term) ||
      email.sender?.toLowerCase().includes(term) ||
      email.senderEmail?.toLowerCase().includes(term)
    );
  }

  /**
   * Filter by date range
   */
  private applyDateRangeFilter(emails: Email[], dateFrom?: Date, dateTo?: Date): Email[] {
    if (!dateFrom && !dateTo) {
      return emails;
    }

    return emails.filter(email => {
      const emailDate = new Date(email.timestamp);
      
      if (dateFrom && emailDate < dateFrom) {
        return false;
      }
      
      if (dateTo) {
        // Set time to end of day for dateTo
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (emailDate > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Filter by sender
   */
  private applySenderFilter(emails: Email[], sender?: string): Email[] {
    if (!sender || sender.trim() === '') {
      return emails;
    }

    const senderLower = sender.toLowerCase().trim();
    return emails.filter(email =>
      email.sender?.toLowerCase().includes(senderLower) ||
      email.senderEmail?.toLowerCase().includes(senderLower)
    );
  }

  /**
   * Filter by priority (can select multiple priorities)
   */
  private applyPriorityFilter(emails: Email[], priorities?: number[]): Email[] {
    if (!priorities || priorities.length === 0) {
      return emails;
    }

    return emails.filter(email => priorities.includes(email.priority));
  }

  /**
   * Filter by attachment presence
   */
  private applyAttachmentFilter(emails: Email[], hasAttachment?: boolean): Email[] {
    if (hasAttachment === undefined || hasAttachment === null) {
      return emails;
    }

    return emails.filter(email => email.hasAttachment === hasAttachment);
  }

  /**
   * Filter by starred status
   */
  private applyStarredFilter(emails: Email[], isStarred?: boolean): Email[] {
    if (isStarred === undefined || isStarred === null) {
      return emails;
    }

    return emails.filter(email => email.isStarred === isStarred);
  }

  /**
   * Filter by subject contains
   */
  private applySubjectFilter(emails: Email[], subjectContains?: string): Email[] {
    if (!subjectContains || subjectContains.trim() === '') {
      return emails;
    }

    const term = subjectContains.toLowerCase().trim();
    return emails.filter(email =>
      email.subject?.toLowerCase().includes(term)
    );
  }

  /**
   * Filter by body contains
   */
  private applyBodyFilter(emails: Email[], bodyContains?: string): Email[] {
    if (!bodyContains || bodyContains.trim() === '') {
      return emails;
    }

    const term = bodyContains.toLowerCase().trim();
    return emails.filter(email =>
      email.body?.toLowerCase().includes(term)
    );
  }

  /**
   * Apply sorting
   */
  private applySorting(emails: Email[], sort: SortCriteria): Email[] {
    const sorted = [...emails];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;

        case 'sender':
          comparison = (a.sender || '').localeCompare(b.sender || '');
          break;

        case 'subject':
          comparison = (a.subject || '').localeCompare(b.subject || '');
          break;

        case 'priority':
          comparison = a.priority - b.priority;
          break;

        default:
          comparison = 0;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filters: FilterCriteria): boolean {
    return !!(
      filters.searchTerm ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.sender ||
      (filters.priority && filters.priority.length > 0) ||
      filters.hasAttachment !== undefined ||
      filters.isStarred !== undefined ||
      filters.subjectContains ||
      filters.bodyContains
    );
  }

  /**
   * Clear all filters
   */
  clearFilters(): FilterCriteria {
    return {};
  }
}