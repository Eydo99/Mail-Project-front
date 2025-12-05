export interface FilterCriteria {
  searchTerm?: string;
  sender?: string;
  hasAttachment?: boolean;
  importance?: 'low' | 'normal' | 'high';
  dateFrom?: Date;
  dateTo?: Date;
}

