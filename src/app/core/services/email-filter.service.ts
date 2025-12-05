// services/email-filter.service.ts
// Shared service for filtering, searching, and sorting emails

import { Injectable } from '@angular/core';
import { Email} from '../models/email.model';
import { FilterCriteria } from '../models/FilterCriteria';
import { SortCriteria } from '../models/SortCriteria';

@Injectable({
  providedIn: 'root'
})
export class EmailFilterService {

  /**
   * Search emails by term (searches in subject, sender, body, attachments)
   */
  searchEmails(emails: Email[], searchTerm: string): Email[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return emails;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return emails.filter(email => 
      email.subject.toLowerCase().includes(term) ||
      email.sender.toLowerCase().includes(term) ||
      email.senderEmail.toLowerCase().includes(term) ||
      email.body.toLowerCase().includes(term) //||
      //email.receivers.some(r => r.toLowerCase().includes(term)) //||
     // email.attachments.some(a => a.name.toLowerCase().includes(term)
    );
  }

  /**
   * Filter emails based on criteria
   */
  filterEmails(emails: Email[], criteria: FilterCriteria): Email[] {
    let filtered = [...emails];

    // Search term
    if (criteria.searchTerm) {
      filtered = this.searchEmails(filtered, criteria.searchTerm);
    }

    // Filter by sender
    if (criteria.sender) {
      const sender = criteria.sender.toLowerCase();
      filtered = filtered.filter(email => 
        email.sender.toLowerCase().includes(sender) ||
        email.senderEmail.toLowerCase().includes(sender)
      );
    }

    // Filter by attachment
    if (criteria.hasAttachment !== undefined) {
      filtered = filtered.filter(email => email.hasAttachment === criteria.hasAttachment);
    }

    // Filter by importance
    //if (criteria.importance) {
     // filtered = filtered.filter(email => email.importance === criteria.importance);
   // }

    // Filter by date range
    //if (criteria.dateFrom) {
      //filtered = filtered.filter(email => email.date >= criteria.dateFrom!);
   // }

   // if (criteria.dateTo) {
     // filtered = filtered.filter(email => email.date <= criteria.dateTo!);
   // }

    return filtered;
  }

  /**
   * Sort emails based on criteria
   */
  sortEmails(emails: Email[], criteria: SortCriteria): Email[] {
    const sorted = [...emails];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (criteria.field) {
       // case 'date':
         // comparison = a.date.getTime() - b.date.getTime();
         // break;

        case 'sender':
          comparison = a.sender.localeCompare(b.sender);
          break;

        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;

       // case 'importance':
         // const importanceOrder = { low: 0, normal: 1, high: 2 };
          //comparison = importanceOrder[a.importance] - importanceOrder[b.importance];
          //break;
      }

      return criteria.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Apply search, filter, and sort together
   */
  processEmails(
    emails: Email[], 
    filterCriteria: FilterCriteria, 
    sortCriteria: SortCriteria
  ): Email[] {
    let processed = this.filterEmails(emails, filterCriteria);
    processed = this.sortEmails(processed, sortCriteria);
    return processed;
  }

  /**
   * Get emails by folder
   */
  getEmailsByFolder(emails: Email[], folder: Email['folder']): Email[] {
    return emails.filter(email => email.folder === folder);
  }

  /**
   * Move emails to a specific folder
   */
  moveToFolder(emails: Email[], folder: Email['folder']): Email[] {
    return emails.map(email => ({
      ...email,
      folder: folder
    }));
  }
}